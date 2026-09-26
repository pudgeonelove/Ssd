const SUBJECTS = [
  { key:'geography',  icon:'🌍', href:'geography.html', ready:true },
  { key:'math',        icon:'📐', href:'math.html', ready:true },
  { key:'physics',      icon:'⚛️', ready:false },
  { key:'chemistry',    icon:'🧪', ready:false },
  { key:'biology',      icon:'🧬', ready:false },
  { key:'history',      icon:'🏛️', ready:false },
  { key:'literature',   icon:'📚', ready:false },
  { key:'russian',      icon:'✍️', ready:false },
  { key:'english',      icon:'🔤', ready:false },
  { key:'informatics',  icon:'💻', ready:false },
];

function renderSubjects(){
  const dict = t().subjects;
  const grid = document.getElementById('subjectGrid');
  grid.innerHTML = '';
  SUBJECTS.forEach((s, i)=>{
    const info = dict[s.key];
    const card = document.createElement(s.ready ? 'a' : 'div');
    card.className = 'card' + (s.ready ? ' ready' : '');
    if (s.ready) card.href = s.href;
    card.style.animationDelay = (i*0.05) + 's';
    card.innerHTML = `
      <span class="badge">${s.ready ? t().readyBadge : t().soonBadge}</span>
      <span class="icon">${s.icon}</span>
      <h3>${info.title}</h3>
      <p>${info.desc}</p>`;
    if (!s.ready){
      card.addEventListener('click', ()=> showToast(t().soonToast));
    }
    grid.appendChild(card);
  });
}

function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> el.classList.remove('show'), 2200);
}

document.addEventListener('DOMContentLoaded', renderSubjects);
document.addEventListener('langchange', renderSubjects);
