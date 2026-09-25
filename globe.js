let scene, camera, renderer, globeGroup, raycaster, markers = [];
let dragging = false, lastX = 0, lastY = 0, velX = 0.0016, velY = 0;
let selectedId = null, selectedMode = 'short';
let tapStart = null, tapCount = 0, tapTimer = null;

function latLngToVec3(lat, lng, r){
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeEarthTexture(){
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,0,1024);
  grad.addColorStop(0,'#123a63'); grad.addColorStop(0.5,'#0c5a78'); grad.addColorStop(1,'#123a63');
  ctx.fillStyle = grad; ctx.fillRect(0,0,2048,1024);
  ctx.fillStyle = '#2fae63';
  const land = [
    [300,300,190,150,0.15],[260,430,90,90,0],
    [360,640,90,170,-0.12],
    [1030,290,150,140,0],[1280,260,260,170,0.05],[1500,230,150,120,0.2],
    [1080,560,150,220,0.1],
    [1660,640,110,90,0],
  ];
  land.forEach(([x,y,rx,ry,rot])=>{
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  });
  ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
  for(let i=0;i<=12;i++){ const x=i*2048/12; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,1024); ctx.stroke(); }
  for(let j=0;j<=6;j++){ const y=j*1024/6; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(2048,y); ctx.stroke(); }
  return new THREE.CanvasTexture(c);
}

function initGlobe(){
  const stage = document.getElementById('globeStage');
  const w = stage.clientWidth, h = stage.clientHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
  camera.position.z = 13;

  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  stage.appendChild(renderer.domElement);

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const geo = new THREE.SphereGeometry(5, 48, 48);
  const mat = new THREE.MeshPhongMaterial({ map: makeEarthTexture(), shininess:8 });
  const sphere = new THREE.Mesh(geo, mat);
  globeGroup.add(sphere);

  const glowGeo = new THREE.SphereGeometry(5.15, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color:0x7c5cff, transparent:true, opacity:0.06, side:THREE.BackSide });
  globeGroup.add(new THREE.Mesh(glowGeo, glowMat));

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dl = new THREE.DirectionalLight(0xffffff, 0.9);
  dl.position.set(5,3,5);
  scene.add(dl);

  markers = COUNTRIES.map(c=>{
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color:0xffcc66 })
    );
    m.position.copy(latLngToVec3(c.lat, c.lng, 5.12));
    m.userData.country = c;
    globeGroup.add(m);
    return m;
  });

  raycaster = new THREE.Raycaster();
  raycaster.params.Mesh = { threshold: 0.15 };
  raycaster.params.Points = { threshold: 0.15 };

  const dom = renderer.domElement;
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
  camera.aspect = w/h; camera.updateProjectionMatrix();
  renderer.setSize(w,h);
}

function onDown(e){
  dragging = true; lastX = e.clientX; lastY = e.clientY;
  tapStart = { x:e.clientX, y:e.clientY, t:Date.now() };
}
function onMove(e){
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  globeGroup.rotation.y += dx * 0.005;
  globeGroup.rotation.x += dy * 0.005;
  globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x));
  lastX = e.clientX; lastY = e.clientY;
  velY = 0;
  velX = dx * 0.0006;
}
function onUp(e){
  dragging = false;
  if (!tapStart) return;
  const moved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y);
  if (moved < 6){
    tapCount++;
    if (tapCount === 1){
      tapTimer = setTimeout(()=>{ handleTap(e, 'short'); tapCount = 0; }, 260);
    } else {
      clearTimeout(tapTimer); tapCount = 0;
      handleTap(e, 'full');
    }
  }
  tapStart = null;
}

function handleTap(e, mode){
  const stage = document.getElementById('globeStage');
  const rect = stage.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera({x,y}, camera);
  const hits = raycaster.intersectObjects(markers);
  if (hits.length){
    const c = hits[0].object.userData.country;
    selectedId = c.id; selectedMode = mode;
    renderInfoPanel();
    markers.forEach(m=> m.scale.setScalar(m.userData.country.id === c.id ? 1.9 : 1));
  }
}

function animate(){
  requestAnimationFrame(animate);
  if (!dragging){
    globeGroup.rotation.y += velX;
    velX *= 0.985;
    if (Math.abs(velX) < 0.0006) velX = 0.0016;
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
  const c = COUNTRIES.find(x=>x.id===selectedId);
  const d = c[lang];
  const isFull = selectedMode === 'full';
  panel.innerHTML = `
    <div class="country-mode">${isFull ? t().modeFull : t().modeShort}</div>
    <h2 class="country-name">${d.name}</h2>
    <div class="desc-toggle">
      <button class="${!isFull?'active':''}" id="briefBtn">${t().briefBtn}</button>
      <button class="${isFull?'active':''}" id="fullBtn">${t().fullBtn}</button>
    </div>
    <div class="fact"><span>${t().capital}</span><span>${d.capital}</span></div>
    <div class="fact"><span>${t().area}</span><span>${c.area.toLocaleString('ru-RU')} км²</span></div>
    <div class="fact"><span>${t().population}</span><span>${c.population.toLocaleString('ru-RU')}</span></div>
    <div class="fact"><span>${t().region}</span><span>${d.region}</span></div>
    <div class="fact"><span>${t().currency}</span><span>${d.currency}</span></div>
    <div class="fact"><span>${d.leaderTitle}</span><span>${d.leader}</span></div>
    <div class="country-desc">${isFull ? d.full : d.short}</div>
  `;
  document.getElementById('briefBtn').onclick = ()=>{ selectedMode='short'; renderInfoPanel(); };
  document.getElementById('fullBtn').onclick = ()=>{ selectedMode='full'; renderInfoPanel(); };
}

document.addEventListener('langchange', renderInfoPanel);
