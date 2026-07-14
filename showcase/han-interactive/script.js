const stage = document.getElementById('stage');
const card = document.getElementById('demoCard');
const core = document.getElementById('hanCore');
const halo = document.getElementById('halo');
const particleField = document.getElementById('particleField');
const moodRange = document.getElementById('moodRange');
const moodName = document.getElementById('moodName');
const titleText = document.getElementById('titleText');
const bodyText = document.getElementById('bodyText');

const moods = [
  {
    limit: 34,
    name: '沉静',
    accent: '#6f7a70',
    glow: 'rgba(111, 122, 112, .46)',
    aura: 'rgba(150, 168, 150, .28)',
    title: '她在低频呼吸，等你靠近。',
    body: '移动鼠标，她会转向你；点击中央，她会醒来；拖动下方的情绪刻度，气质会从沉静过渡到发光。'
  },
  {
    limit: 68,
    name: '微光',
    accent: '#a68563',
    glow: 'rgba(180, 140, 88, .55)',
    aura: 'rgba(234, 205, 142, .35)',
    title: '她听见你了，光从边缘醒来。',
    body: '这不是一段单向播放的动画，而是一个会被你的动作牵引的小界面。靠近、点击、停留，都会改变它的呼吸。'
  },
  {
    limit: 101,
    name: '醒来',
    accent: '#c56d5c',
    glow: 'rgba(214, 108, 82, .58)',
    aura: 'rgba(255, 178, 135, .4)',
    title: '她醒了，像一枚被点亮的印。',
    body: '之后可以继续加状态机：陪伴、记录、提醒、回应。先从这个小生命感开始，把互动做得柔软而准确。'
  }
];

let awakeTimer = null;
let lastX = 0;
let lastY = 0;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function setMood(value) {
  const mood = moods.find(item => value < item.limit) || moods[0];
  document.documentElement.style.setProperty('--accent', mood.accent);
  document.documentElement.style.setProperty('--glow', mood.glow);
  document.documentElement.style.setProperty('--aura', mood.aura);
  document.documentElement.style.setProperty('--accent-soft', mood.glow.replace('.55', '.18').replace('.58', '.18').replace('.46', '.18'));
  moodName.textContent = mood.name;
  titleText.textContent = mood.title;
  bodyText.textContent = mood.body;
}

function burst(count = 22) {
  particleField.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement('span');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.24;
    const distance = 82 + Math.random() * 78;
    p.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    p.style.animationDelay = `${Math.random() * 0.08}s`;
    p.style.width = `${4 + Math.random() * 7}px`;
    p.style.height = p.style.width;
    particleField.appendChild(p);
  }
}

function wake() {
  stage.classList.add('awake');
  burst(26);
  clearTimeout(awakeTimer);
  awakeTimer = setTimeout(() => stage.classList.remove('awake'), 1150);
}

function handleMouseMove(event) {
  const rect = card.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  lastX += (x - lastX) * 0.16;
  lastY += (y - lastY) * 0.16;

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clamp((lastX - cx) / rect.width, -0.5, 0.5);
  const dy = clamp((lastY - cy) / rect.height, -0.5, 0.5);

  stage.style.setProperty('--mx', `${(x / window.innerWidth) * 100}%`);
  stage.style.setProperty('--my', `${(y / window.innerHeight) * 100}%`);
  card.style.setProperty('--card-x', `${((x - rect.left) / rect.width) * 100}%`);
  card.style.setProperty('--card-y', `${((y - rect.top) / rect.height) * 100}%`);
  card.style.setProperty('--rx', `${dy * -7}deg`);
  card.style.setProperty('--ry', `${dx * 9}deg`);
  stage.style.setProperty('--look-x', `${dx * 22}px`);
  stage.style.setProperty('--look-y', `${dy * 18}px`);
}

function resetTilt() {
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  stage.style.setProperty('--look-x', '0px');
  stage.style.setProperty('--look-y', '0px');
}

card.addEventListener('mouseenter', () => stage.classList.add('near'));
card.addEventListener('mouseleave', () => {
  stage.classList.remove('near');
  resetTilt();
});
card.addEventListener('mousemove', handleMouseMove);
core.addEventListener('click', wake);

moodRange.addEventListener('input', event => {
  setMood(Number(event.target.value));
  if (Number(event.target.value) > 72) {
    burst(14);
  }
});

window.addEventListener('keydown', event => {
  if (event.key === ' ' || event.key === 'Enter') {
    wake();
  }
});

setMood(Number(moodRange.value));
setTimeout(() => burst(18), 720);
