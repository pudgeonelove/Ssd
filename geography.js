const CONTINENTS = [
  { key:'Африка / Африка', area:30.4, pop:1.5, countries:54 },
  { key:'Азия / Азия', area:44.6, pop:4.8, countries:48 },
  { key:'Северная Америка / Түндүк Америка', area:24.7, pop:0.6, countries:23 },
  { key:'Южная Америка / Түштүк Америка', area:17.8, pop:0.44, countries:12 },
  { key:'Антарктида / Антарктида', area:14.0, pop:0, countries:0 },
  { key:'Европа / Европа', area:10.2, pop:0.75, countries:44 },
  { key:'Австралия и Океания / Австралия жана Океания', area:8.6, pop:0.045, countries:14 },
];

let contMode = 'short';

function renderContinentsTable(){
  const lang = getLang();
  const body = document.getElementById('continentsBody');
  body.innerHTML = CONTINENTS.map(c=>{
    const name = c.key.split(' / ')[lang==='ky'?1:0];
    return `<tr><td>${name}</td><td>${c.area}</td><td>${c.pop}</td><td>${c.countries||'—'}</td></tr>`;
  }).join('');
}

function renderStatic(){
  document.getElementById('continentsIntro').textContent = t().continentsIntro;
  document.getElementById('continentsText').textContent = contMode==='full' ? t().continentsFullText : t().continentsIntro;
  document.getElementById('contBriefBtn').textContent = t().briefBtn;
  document.getElementById('contFullBtn').textContent = t().fullBtn;
  document.getElementById('thContinent').textContent = t().thContinent;
  document.getElementById('thArea').textContent = t().thArea;
  document.getElementById('thPop').textContent = t().thPop;
  document.getElementById('thCountries').textContent = t().thCountries;
  renderContinentsTable();
}

document.querySelectorAll('.topic-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.topic-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.getElementById('section-' + btn.dataset.topic).classList.add('active');
  });
});

document.getElementById('contBriefBtn').addEventListener('click', ()=>{
  contMode='short';
  document.getElementById('contBriefBtn').classList.add('active');
  document.getElementById('contFullBtn').classList.remove('active');
  document.getElementById('continentsText').textContent = t().continentsIntro;
});
document.getElementById('contFullBtn').addEventListener('click', ()=>{
  contMode='full';
  document.getElementById('contFullBtn').classList.add('active');
  document.getElementById('contBriefBtn').classList.remove('active');
  document.getElementById('continentsText').textContent = t().continentsFullText;
});

document.addEventListener('DOMContentLoaded', ()=>{
  renderStatic();
  renderInfoPanel();
  initGlobe();
});
document.addEventListener('langchange', ()=>{
  renderStatic();
  renderInfoPanel();
});
