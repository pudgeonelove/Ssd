/* Глобус: сфера с реальной фотографической текстурой Земли (лёгкая, не тормозит),
   плюс невидимый canvas-"id-slot карта", где каждая страна закрашена уникальным
   цветом по её упрощённому контуру (COUNTRIES[i].poly). Клик/двойной клик определяет
   страну не по точке-маркеру, а по пикселю этой id-карты в месте попадания луча —
   то есть по форме самой страны. */

let scene, camera, renderer, globeGroup, sphereMesh, raycaster;
let dragging = false, lastX = 0, lastY = 0;
let velX = 0.0009, velY = 0;
const IDLE_SPIN = 0.0009;
let selectedId = null, selectedMode = 'short';
let tapStart = null, tapCount = 0, tapTimer = null;

const MAP_W = 2048, MAP_H = 1024;
let idCanvas, idCtx;
let highlightCanvas, highlightCtx, highlightTexture;

function project(lat, lng){
  return { x: (lng + 180) / 360 * MAP_W, y: (90 - lat) / 180 * MAP_H };
}

function drawPoly(ctx, poly){
  ctx.beginPath();
  poly.forEach((p, i) => {
    const {x, y} = project(p[0], p[1]);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function buildIdMap(){
  idCanvas = document.createElement('canvas');
  idCanvas.width = MAP_W; idCanvas.height = MAP_H;
  idCtx = idCanvas.getContext('2d', { willReadFrequently: true });
  COUNTRIES.forEach((c, i) => {
    idCtx.fillStyle = `rgb(${i+1},0,0)`;
    drawPoly(idCtx, c.poly);
    idCtx.fill();
  });
}

function buildHighlightCanvas(){
  highlightCanvas = document.createElement('canvas');
  highlightCanvas.width = MAP_W; highlightCanvas.height = MAP_H;
  highlightCtx = highlightCanvas.getContext('2d');
  highlightTexture = new THREE.CanvasTexture(highlightCanvas);
}

function paintHighlight(country){
  highlightCtx.clearRect(0, 0, MAP_W, MAP_H);
  if (country){
    drawPoly(highlightCtx, country.poly);
    highlightCtx.fillStyle = 'rgba(255,204,102,0.45)';
    highlightCtx.fill();
    highlightCtx.lineWidth = 3;
    highlightCtx.strokeStyle = 'rgba(255,204,102,0.95)';
    highlightCtx.stroke();
  }
  highlightTexture.needsUpdate = true;
}

function initGlobe(){
  const stage = document.getElementById('globeStage');
  const w = stage.clientWidth, h = stage.clientHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 13;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  buildIdMap();
  buildHighlightCanvas();

  const loader = new THREE.TextureLoader();
  const earthMap = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  const specMap = loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');

  const geo = new THREE.SphereGeometry(5, 64, 64);
  const mat = new THREE.MeshPhongMaterial({ map: earthMap, specularMap: specMap, specular: 0x333333, shininess: 6 });
  sphereMesh = new THREE.Mesh(geo, mat);
  globeGroup.add(sphereMesh);

  const hlGeo = new THREE.SphereGeometry(5.01, 64, 64);
  const hlMat = new THREE.MeshBasicMaterial({ map: highlightTexture, transparent: true, depthWrite: false });
  globeGroup.add(new THREE.Mesh(hlGeo, hlMat));

  const glowGeo = new THREE.SphereGeometry(5.2, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.05, side: THREE.BackSide });
  globeGroup.add(new THREE.Mesh(glowGeo, glowMat));

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const dl = new THREE.DirectionalLight(0xffffff, 0.9);
  dl.position.set(5, 3, 5);
  scene.add(dl);

  raycaster = new THREE.Raycaster();

  const dom = renderer.domElement;
  dom.style.touchAction = 'none';
  dom.addEventListener('pointerdown', onDown);
  dom.addEventListener('pointermove', onMove);
  dom.addEventListener('pointerup', onUp);
  dom.addEventListener('pointerleave', onUp);
  window.addEventListener('resize', onResize);

  animate();
}

function onResize(){
  const stage = document.getElementById('globeStage');
  if (!stage || !renderer) return;
  const w = stage.clientWidth, h = stage.clientHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function onDown(e){
  dragging = true; lastX = e.clientX; lastY = e.clientY;
  tapStart = { x: e.clientX, y: e.clientY };
}
function onMove(e){
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  globeGroup.rotation.y += dx * 0.005;
  globeGroup.rotation.x += dy * 0.005;
  globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x));
  lastX = e.clientX; lastY = e.clientY;
  velX = dx * 0.0006;
}
function onUp(e){
  dragging = false;
  if (!tapStart) return;
  const moved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y);
  if (moved < 6){
    tapCount++;
    if (tapCount === 1){
      tapTimer = setTimeout(() => { pickAt(e, 'short'); tapCount = 0; }, 260);
    } else {
      clearTimeout(tapTimer); tapCount = 0;
      pickAt(e, 'full');
    }
  }
  tapStart = null;
}

function pickAt(e, mode){
  const stage = document.getElementById('globeStage');
  const rect = stage.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera({ x, y }, camera);
  const hit = raycaster.intersectObject(sphereMesh)[0];
  if (!hit) return;

  const local = sphereMesh.worldToLocal(hit.point.clone());
  const r = local.length();
  const lat = 90 - Math.acos(local.y / r) * 180 / Math.PI;
  let theta = Math.atan2(local.z, -local.x);
  if (theta < 0) theta += Math.PI * 2;
  const lng = theta * 180 / Math.PI - 180;

  const { x: px, y: py } = project(lat, lng);
  const pixel = idCtx.getImageData(Math.max(0, Math.min(MAP_W - 1, Math.round(px))), Math.max(0, Math.min(MAP_H - 1, Math.round(py))), 1, 1).data;
  if (pixel[3] === 0) return; // мимо суши/страны на карте

  const country = COUNTRIES[pixel[0] - 1];
  if (!country) return;
  selectedId = country.id; selectedMode = mode;
  paintHighlight(country);
  renderInfoPanel();
}

function animate(){
  requestAnimationFrame(animate);
  if (!dragging){
    globeGroup.rotation.y += velX;
    velX += (IDLE_SPIN - velX) * 0.01;
  }
  renderer.render(scene, camera);
}

function renderInfoPanel(){
  const panel = document.getElementById('infoPanel');
  const lang = getLang();
  if (!selectedId){
    panel.innerHTML = `<div class="info-empty"><span class="icon">🌐</span><div>${t().infoEmptyTitle}</div><p>${t().infoEmptyText}</p></div>`;
    return;
  }
  const c = COUNTRIES.find(x => x.id === selectedId);
  const d = c[lang];
  const isFull = selectedMode === 'full';
  panel.innerHTML = `
    <div class="country-mode">${isFull ? t().modeFull : t().modeShort}</div>
    <h2 class="country-name">${d.name}</h2>
    <div class="desc-toggle">
      <button class="${!isFull ? 'active' : ''}" id="briefBtn">${t().briefBtn}</button>
      <button class="${isFull ? 'active' : ''}" id="fullBtn">${t().fullBtn}</button>
    </div>
    <div class="fact"><span>${t().capital}</span><span>${d.capital}</span></div>
    <div class="fact"><span>${t().area}</span><span>${c.area.toLocaleString('ru-RU')} км²</span></div>
    <div class="fact"><span>${t().population}</span><span>${c.population.toLocaleString('ru-RU')}</span></div>
    <div class="fact"><span>${t().region}</span><span>${d.region}</span></div>
    <div class="fact"><span>${t().currency}</span><span>${d.currency}</span></div>
    <div class="fact"><span>${d.leaderTitle}</span><span>${d.leader}</span></div>
    <div class="country-desc">${isFull ? d.full : d.short}</div>
  `;
  document.getElementById('briefBtn').onclick = () => { selectedMode = 'short'; renderInfoPanel(); };
  document.getElementById('fullBtn').onclick = () => { selectedMode = 'full'; renderInfoPanel(); };
}

document.addEventListener('langchange', renderInfoPanel);
