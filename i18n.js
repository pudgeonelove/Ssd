/* Общий словарь интерфейса. Добавляйте новые ключи сюда, а не в HTML напрямую. */
const I18N = {
  ru: {
    siteName: 'ШколаХаб',
    heroTitle: 'Выбери предмет',
    heroText: 'Один сайт для всех школьных уроков: краткая и подробная теория, формулы, схемы, таблицы и интерактив.',
    back: 'Все предметы',
    subjects: {
      geography: { title: 'География', desc: 'Материки, страны и интерактивный 3D-глобус' },
      math: { title: 'Математика', desc: 'Формулы, теоремы и разборы задач' },
      physics: { title: 'Физика', desc: 'Законы, формулы и опыты' },
      chemistry: { title: 'Химия', desc: 'Элементы, реакции и таблица Менделеева' },
      biology: { title: 'Биология', desc: 'Клетки, организмы и экосистемы' },
      history: { title: 'История', desc: 'Даты, события и личности' },
      literature: { title: 'Литература', desc: 'Произведения и авторы' },
      russian: { title: 'Русский язык', desc: 'Правила, орфография и пунктуация' },
      english: { title: 'Английский язык', desc: 'Грамматика и лексика' },
      informatics: { title: 'Информатика', desc: 'Алгоритмы и программирование' },
    },
    readyBadge: 'Готово',
    soonBadge: 'Скоро',
    soonToast: 'Этот предмет ещё в разработке — загляни позже',
    topicCountries: 'Страны мира',
    topicContinents: 'Материки и океаны',
    globeHint: 'Крутите глобус — 1 клик: кратко, 2 клика: подробно',
    infoEmptyTitle: 'Выберите страну',
    infoEmptyText: 'Один клик по метке — краткая справка. Двойной клик — подробная информация.',
    modeShort: 'Краткая справка',
    modeFull: 'Подробная информация',
    area: 'Площадь', population: 'Население', region: 'Регион', currency: 'Валюта',
    capital: 'Столица', leader: 'Глава государства',
    briefBtn: 'Кратко', fullBtn: 'Подробно',
    continentsIntro: 'На Земле выделяют шесть материков (континентов) и несколько океанов. Ниже — краткая и подробная сводка по каждому материку.',
    continentsFullText: 'Материк — крупный массив суши, окружённый океанами. Границы между Европой и Азией проводят условно по Уральским горам, поэтому иногда их считают одним материком Евразия. Океаны регулируют климат планеты, участвуют в круговороте воды и являются домом для большей части живых организмов Земли.',
    thContinent: 'Материк', thArea: 'Площадь, млн км²', thPop: 'Население, млрд', thCountries: 'Стран',
    footer: 'Учебный проект · данные обновляются постепенно',
  },
  ky: {
    siteName: 'МектепХаб',
    heroTitle: 'Сабакты тандаңыз',
    heroText: 'Бардык мектеп сабактары үчүн бир сайт: кыскача жана толук теория, формулалар, схемалар, таблицалар жана интерактив.',
    back: 'Бардык сабактар',
    subjects: {
      geography: { title: 'География', desc: 'Материктер, өлкөлөр жана интерактивдүү 3D-глобус' },
      math: { title: 'Математика', desc: 'Формулалар, теоремалар жана маселелер' },
      physics: { title: 'Физика', desc: 'Мыйзамдар, формулалар жана тажрыйбалар' },
      chemistry: { title: 'Химия', desc: 'Элементтер, реакциялар жана Менделеев таблицасы' },
      biology: { title: 'Биология', desc: 'Клеткалар, организмдер жана экосистемалар' },
      history: { title: 'Тарых', desc: 'Даталар, окуялар жана инсандар' },
      literature: { title: 'Адабият', desc: 'Чыгармалар жана авторлор' },
      russian: { title: 'Орус тили', desc: 'Эрежелер, орфография жана пунктуация' },
      english: { title: 'Англис тили', desc: 'Грамматика жана лексика' },
      informatics: { title: 'Информатика', desc: 'Алгоритмдер жана программалоо' },
    },
    readyBadge: 'Даяр',
    soonBadge: 'Жакында',
    soonToast: 'Бул сабак азырынча иштелип жатат — кийинчерээк кайрылыңыз',
    topicCountries: 'Дүйнө өлкөлөрү',
    topicContinents: 'Материктер жана океандар',
    globeHint: 'Глобусту айлантыңыз — 1 клик: кыскача, 2 клик: толук маалымат',
    infoEmptyTitle: 'Өлкөнү тандаңыз',
    infoEmptyText: 'Белгини бир жолу басканда — кыскача маалымат. Эки жолу басканда — толук маалымат.',
    modeShort: 'Кыскача маалымат',
    modeFull: 'Толук маалымат',
    area: 'Аянты', population: 'Калкы', region: 'Аймак', currency: 'Валютасы',
    capital: 'Борбору', leader: 'Мамлекет башчысы',
    briefBtn: 'Кыскача', fullBtn: 'Толук',
    continentsIntro: 'Жер планетасында алты материк жана бир нече океан бар. Төмөндө ар бир материк боюнча кыскача жана толук маалымат берилген.',
    continentsFullText: 'Материк — океандар менен курчалган кургактыктын чоң бөлүгү. Европа менен Азиянын чек арасы шарттуу түрдө Урал тоолору боюнча жүргүзүлөт, ошондуктан кээде аларды бирдиктүү Евразия материги деп эсептешет. Океандар планетанын климатын жөнгө салат, суунун айлануусуна катышат жана Жердеги жандыктардын көбүнүн үйү болуп саналат.',
    thContinent: 'Материк', thArea: 'Аянты, млн км²', thPop: 'Калкы, млрд', thCountries: 'Өлкө саны',
    footer: 'Окуу долбоору · маалыматтар акырындык менен толукталат',
  }
};

function getLang(){ return localStorage.getItem('lang') || 'ru'; }
function setLang(l){ localStorage.setItem('lang', l); applyLang(); document.dispatchEvent(new CustomEvent('langchange',{detail:l})); }
function t(){ return I18N[getLang()]; }

function applyLang(){
  const lang = getLang();
  document.documentElement.lang = lang === 'ky' ? 'ky' : 'ru';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const val = key.split('.').reduce((o,k)=>o&&o[k], t());
    if (typeof val === 'string') el.textContent = val;
  });
  document.querySelectorAll('.lang-toggle button').forEach(b=>{
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

function initLangToggle(){
  document.querySelectorAll('.lang-toggle').forEach(box=>{
    box.querySelectorAll('button').forEach(b=>{
      b.addEventListener('click', ()=> setLang(b.dataset.lang));
    });
  });
  applyLang();
}

document.addEventListener('DOMContentLoaded', initLangToggle);
