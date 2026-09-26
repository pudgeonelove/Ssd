const SVG_SIZE = 400, PAD = 24;
const X_MIN = -10, X_MAX = 10;

function makeTransform(yMin, yMax){
  const xScale = (SVG_SIZE - 2*PAD) / (X_MAX - X_MIN);
  const yScale = (SVG_SIZE - 2*PAD) / (yMax - yMin);
  return {
    toSvgX: x => PAD + (x - X_MIN) * xScale,
    toSvgY: y => SVG_SIZE - PAD - (y - yMin) * yScale,
    toDataX: sx => X_MIN + (sx - PAD) / xScale,
    yMin, yMax
  };
}

function svgEl(tag, attrs){
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}

function drawAxesAndGrid(svg, tr){
  for (let gx = Math.ceil(X_MIN); gx <= X_MAX; gx++){
    svg.appendChild(svgEl('line', { x1:tr.toSvgX(gx), y1:PAD, x2:tr.toSvgX(gx), y2:SVG_SIZE-PAD, stroke:'rgba(255,255,255,.06)' }));
  }
  const step = Math.max(1, Math.round((tr.yMax - tr.yMin)/10));
  for (let gy = Math.ceil(tr.yMin); gy <= tr.yMax; gy += step){
    svg.appendChild(svgEl('line', { x1:PAD, y1:tr.toSvgY(gy), x2:SVG_SIZE-PAD, y2:tr.toSvgY(gy), stroke:'rgba(255,255,255,.06)' }));
  }
  if (tr.yMin <= 0 && tr.yMax >= 0){
    svg.appendChild(svgEl('line', { x1:PAD, y1:tr.toSvgY(0), x2:SVG_SIZE-PAD, y2:tr.toSvgY(0), stroke:'#7c5cff', 'stroke-width':1.5 }));
  }
  svg.appendChild(svgEl('line', { x1:tr.toSvgX(0), y1:PAD, x2:tr.toSvgX(0), y2:SVG_SIZE-PAD, stroke:'#7c5cff', 'stroke-width':1.5 }));
}

function plotFunction(svg, fn){
  const samples = [];
  for (let i=0;i<=120;i++){
    const x = X_MIN + (X_MAX-X_MIN)*i/120;
    samples.push([x, fn(x)]);
  }
  let yMin = Math.min(...samples.map(p=>p[1]), 0);
  let yMax = Math.max(...samples.map(p=>p[1]), 0);
  if (yMax - yMin < 4){ const mid=(yMax+yMin)/2; yMin=mid-2; yMax=mid+2; }
  const margin = (yMax-yMin)*0.12;
  yMin -= margin; yMax += margin;
  const tr = makeTransform(yMin, yMax);

  svg.innerHTML = '';
  drawAxesAndGrid(svg, tr);
  const d = samples.map((p,i) => (i===0?'M':'L') + tr.toSvgX(p[0]).toFixed(1) + ',' + tr.toSvgY(p[1]).toFixed(1)).join(' ');
  svg.appendChild(svgEl('path', { d, fill:'none', stroke:'#22d3ee', 'stroke-width':2.5 }));
  return tr;
}

function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }

/* ---------- Линейная ---------- */
let linTr;
function renderLinear(){
  const k = parseFloat(document.getElementById('kSlider').value);
  const b = parseFloat(document.getElementById('bSlider').value);
  document.getElementById('kVal').textContent = fmt(k);
  document.getElementById('bVal').textContent = fmt(b);
  const svg = document.getElementById('svgLinear');
  linTr = plotFunction(svg, x => k*x + b);

  const sign = b >= 0 ? '+' : '−';
  document.getElementById('linearFormula').textContent = `y = ${fmt(k)}x ${sign} ${Math.abs(fmt(b))}`;
  document.getElementById('linearSlope').textContent = fmt(k);
  document.getElementById('linearIntercept').textContent = `(0; ${fmt(b)})`;
  document.getElementById('linearRoot').textContent = k !== 0 ? `x = ${fmt(-b/k)}` : '—';
  renderLinearText();
}
function renderLinearText(){
  const full = document.getElementById('linFullBtn').classList.contains('active');
  document.getElementById('linearText').textContent = full ? t().linearFull : t().linearShort;
}

/* ---------- Квадратичная ---------- */
let quadTr;
function renderQuadratic(){
  const a = parseFloat(document.getElementById('aSlider').value);
  const b = parseFloat(document.getElementById('qbSlider').value);
  const c = parseFloat(document.getElementById('cSlider').value);
  document.getElementById('aVal').textContent = fmt(a);
  document.getElementById('qbVal').textContent = fmt(b);
  document.getElementById('cVal').textContent = fmt(c);
  const svg = document.getElementById('svgQuad');
  quadTr = plotFunction(svg, x => a*x*x + b*x + c);

  const bSign = b >= 0 ? '+' : '−', cSign = c >= 0 ? '+' : '−';
  document.getElementById('quadFormula').textContent = `y = ${fmt(a)}x² ${bSign} ${Math.abs(fmt(b))}x ${cSign} ${Math.abs(fmt(c))}`;

  if (a === 0){
    document.getElementById('quadDisc').textContent = '—';
    document.getElementById('quadRoots').textContent = b !== 0 ? `x = ${fmt(-c/b)}` : '—';
    document.getElementById('quadVertex').textContent = '—';
    document.getElementById('quadAxis').textContent = '—';
  } else {
    const D = b*b - 4*a*c;
    const xv = -b/(2*a), yv = c - (b*b)/(4*a);
    document.getElementById('quadDisc').textContent = `D = ${fmt(D)} (${a>0?t().opensUp:t().opensDown})`;
    if (D > 0){
      const x1 = (-b+Math.sqrt(D))/(2*a), x2 = (-b-Math.sqrt(D))/(2*a);
      document.getElementById('quadRoots').textContent = `x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)} (${t().twoRoots})`;
    } else if (D === 0){
      document.getElementById('quadRoots').textContent = `x = ${fmt(-b/(2*a))} (${t().oneRoot})`;
    } else {
      document.getElementById('quadRoots').textContent = t().noRealRoots;
    }
    document.getElementById('quadVertex').textContent = `(${fmt(xv)}; ${fmt(yv)})`;
    document.getElementById('quadAxis').textContent = `x = ${fmt(xv)}`;
  }
  renderQuadraticText();
}
function renderQuadraticText(){
  const full = document.getElementById('quadFullBtn').classList.contains('active');
  document.getElementById('quadText').textContent = full ? t().quadraticFull : t().quadraticShort;
}

function wirePointClick(svgId, readoutId, fnGetter, trGetter){
  document.getElementById(svgId).addEventListener('click', (e) => {
    const tr = trGetter();
    if (!tr) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width * SVG_SIZE;
    const x = tr.toDataX(sx);
    const y = fnGetter()(x);
    document.getElementById(readoutId).textContent = `${t().pointValue}: x=${fmt(x)}, y=${fmt(y)}`;
  });
}

function renderAllStatic(){
  document.getElementById('linBriefBtn').textContent = t().briefBtn;
  document.getElementById('linFullBtn').textContent = t().fullBtn;
  document.getElementById('quadBriefBtn').textContent = t().briefBtn;
  document.getElementById('quadFullBtn').textContent = t().fullBtn;
  renderLinear();
  renderQuadratic();
}

document.querySelectorAll('.topic-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.topic-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.getElementById('section-' + btn.dataset.topic).classList.add('active');
  });
});

['kSlider','bSlider'].forEach(id => document.getElementById(id).addEventListener('input', renderLinear));
['aSlider','qbSlider','cSlider'].forEach(id => document.getElementById(id).addEventListener('input', renderQuadratic));

document.getElementById('linBriefBtn').addEventListener('click', ()=>{
  document.getElementById('linBriefBtn').classList.add('active');
  document.getElementById('linFullBtn').classList.remove('active');
  renderLinearText();
});
document.getElementById('linFullBtn').addEventListener('click', ()=>{
  document.getElementById('linFullBtn').classList.add('active');
  document.getElementById('linBriefBtn').classList.remove('active');
  renderLinearText();
});
document.getElementById('quadBriefBtn').addEventListener('click', ()=>{
  document.getElementById('quadBriefBtn').classList.add('active');
  document.getElementById('quadFullBtn').classList.remove('active');
  renderQuadraticText();
});
document.getElementById('quadFullBtn').addEventListener('click', ()=>{
  document.getElementById('quadFullBtn').classList.add('active');
  document.getElementById('quadBriefBtn').classList.remove('active');
  renderQuadraticText();
});

wirePointClick('svgLinear', 'linearPoint', () => {
  const k = parseFloat(document.getElementById('kSlider').value);
  const b = parseFloat(document.getElementById('bSlider').value);
  return x => k*x + b;
}, () => linTr);

wirePointClick('svgQuad', 'quadPoint', () => {
  const a = parseFloat(document.getElementById('aSlider').value);
  const b = parseFloat(document.getElementById('qbSlider').value);
  const c = parseFloat(document.getElementById('cSlider').value);
  return x => a*x*x + b*x + c;
}, () => quadTr);

document.addEventListener('DOMContentLoaded', renderAllStatic);
document.addEventListener('langchange', renderAllStatic);
