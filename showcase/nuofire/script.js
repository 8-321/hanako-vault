const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d', { alpha: false });
const guide = document.getElementById('guide');

let W = 0;
let H = 0;
let DPR = 1;
let t = 0;
let particles = [];
let sparks = [];
let embers = [];
let waves = [];
let cracks = [];
let mouse = { x: -9999, y: -9999, px: -9999, py: -9999, down: false, moved: false };
let holdStart = 0;
let awakening = 0;
let maskReveal = 0.18;
let dragPath = [];

const palette = {
  paper: '#d8c8ac',
  paperDeep: '#bca984',
  ink: '#2e2b25',
  soot: '#1f1d19',
  cinnabar: '#82382f',
  fire: '#c86b3d',
  fireGold: '#e7ad66',
  ash: '#efe3ca',
  oldGreen: '#5f6d57'
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  createParticles();
}

function maskCenter() {
  return { x: W * 0.53, y: H * 0.49, s: Math.min(W, H) * 0.58 };
}

function createParticles() {
  const count = Math.floor(Math.min(1700, Math.max(850, W * H / 850)));
  particles = [];
  const c = maskCenter();
  for (let i = 0; i < count; i++) {
    const near = Math.random() < 0.58;
    const angle = rand(0, Math.PI * 2);
    const radius = near ? Math.pow(Math.random(), 1.7) * c.s * 0.58 : rand(c.s * .32, c.s * .82);
    const x = near ? c.x + Math.cos(angle) * radius * rand(.55, 1.25) : rand(0, W);
    const y = near ? c.y + Math.sin(angle) * radius * rand(.45, .95) : rand(0, H);
    const tone = Math.random();
    particles.push({
      x, y,
      ox: x,
      oy: y,
      vx: 0,
      vy: 0,
      r: rand(.45, 1.9) * (near ? 1 : .75),
      a: rand(.12, .52),
      drift: rand(.002, .012),
      seed: rand(0, 1000),
      color: tone < .66 ? '82,70,52' : tone < .9 ? '230,213,178' : '122,55,43'
    });
  }
}

function drawBackground() {
  const g = ctx.createRadialGradient(W * .5, H * .38, 40, W * .5, H * .48, Math.max(W, H) * .75);
  g.addColorStop(0, '#eadcc4');
  g.addColorStop(.46, '#d8c8ac');
  g.addColorStop(1, '#ad9b7c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = .22;
  for (let i = 0; i < 70; i++) {
    const y = (i * 37 + t * 3) % H;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(95,74,48,.045)' : 'rgba(255,248,226,.055)';
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();

  drawTempleShadow();
  drawVignette();
}

function drawTempleShadow() {
  const baseY = H * .78;
  ctx.save();
  ctx.globalAlpha = .11;
  ctx.strokeStyle = '#352d24';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(W * .18, baseY);
  ctx.bezierCurveTo(W * .35, H * .66, W * .63, H * .67, W * .84, baseY);
  ctx.stroke();
  ctx.globalAlpha = .075;
  for (let i = 0; i < 8; i++) {
    const x = W * (.28 + i * .065);
    ctx.beginPath();
    ctx.moveTo(x, H * .68);
    ctx.lineTo(x + Math.sin(i) * 8, H * .86);
    ctx.stroke();
  }
  ctx.restore();
}

function drawVignette() {
  const v = ctx.createRadialGradient(W * .52, H * .45, Math.min(W, H) * .22, W * .5, H * .5, Math.max(W, H) * .72);
  v.addColorStop(0, 'rgba(255,255,255,0)');
  v.addColorStop(.68, 'rgba(77,55,32,.08)');
  v.addColorStop(1, 'rgba(38,28,20,.26)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function maskPath() {
  const { x, y, s } = maskCenter();
  const p = new Path2D();
  p.moveTo(x, y - s * .39);
  p.bezierCurveTo(x - s * .26, y - s * .34, x - s * .34, y - s * .12, x - s * .32, y + s * .06);
  p.bezierCurveTo(x - s * .29, y + s * .33, x - s * .13, y + s * .45, x, y + s * .48);
  p.bezierCurveTo(x + s * .13, y + s * .45, x + s * .29, y + s * .33, x + s * .32, y + s * .06);
  p.bezierCurveTo(x + s * .34, y - s * .12, x + s * .26, y - s * .34, x, y - s * .39);
  return p;
}

function drawMask() {
  const { x, y, s } = maskCenter();
  const reveal = Math.min(.92, maskReveal + awakening * .003);
  ctx.save();
  ctx.globalAlpha = reveal;

  const body = maskPath();
  const grad = ctx.createRadialGradient(x - s * .08, y - s * .12, 10, x, y, s * .5);
  grad.addColorStop(0, 'rgba(162,118,77,.58)');
  grad.addColorStop(.52, 'rgba(78,61,44,.66)');
  grad.addColorStop(1, 'rgba(32,29,24,.72)');
  ctx.fillStyle = grad;
  ctx.fill(body);

  ctx.lineWidth = Math.max(1, s * .007);
  ctx.strokeStyle = 'rgba(45,32,23,.72)';
  ctx.stroke(body);

  drawHorns(x, y, s, reveal);
  drawMaskFeatures(x, y, s, reveal);
  drawPatina(x, y, s, reveal);
  ctx.restore();
}

function drawHorns(x, y, s, reveal) {
  ctx.save();
  ctx.globalAlpha = reveal * .75;
  ctx.strokeStyle = 'rgba(64,45,32,.65)';
  ctx.lineWidth = s * .025;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s * .2, y - s * .32);
  ctx.quadraticCurveTo(x - s * .42, y - s * .52, x - s * .48, y - s * .17);
  ctx.moveTo(x + s * .2, y - s * .32);
  ctx.quadraticCurveTo(x + s * .42, y - s * .52, x + s * .48, y - s * .17);
  ctx.stroke();
  ctx.restore();
}

function drawMaskFeatures(x, y, s, reveal) {
  const eyeGlow = Math.min(1, awakening / 45);
  ctx.save();
  ctx.globalAlpha = reveal;

  drawEye(x - s * .13, y - s * .08, s, eyeGlow);
  drawEye(x + s * .13, y - s * .08, s, eyeGlow);

  ctx.strokeStyle = 'rgba(35,26,20,.72)';
  ctx.lineWidth = s * .01;
  ctx.beginPath();
  ctx.moveTo(x, y - s * .03);
  ctx.quadraticCurveTo(x - s * .03, y + s * .1, x, y + s * .2);
  ctx.quadraticCurveTo(x + s * .03, y + s * .1, x, y - s * .03);
  ctx.stroke();

  ctx.lineWidth = s * .013;
  ctx.beginPath();
  ctx.moveTo(x - s * .12, y + s * .29);
  ctx.quadraticCurveTo(x, y + s * .36, x + s * .12, y + s * .29);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(120,48,38,.52)';
  ctx.lineWidth = s * .016;
  ctx.beginPath();
  ctx.moveTo(x - s * .19, y + s * .04);
  ctx.quadraticCurveTo(x - s * .28, y + s * .13, x - s * .21, y + s * .24);
  ctx.moveTo(x + s * .19, y + s * .04);
  ctx.quadraticCurveTo(x + s * .28, y + s * .13, x + s * .21, y + s * .24);
  ctx.stroke();
  ctx.restore();
}

function drawEye(ex, ey, s, glow) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,18,15,.86)';
  ctx.beginPath();
  ctx.ellipse(ex, ey, s * .07, s * .044, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(185,132,78,.25)';
  ctx.lineWidth = s * .009;
  ctx.stroke();

  if (glow > 0) {
    const g = ctx.createRadialGradient(ex, ey, 1, ex, ey, s * .12);
    g.addColorStop(0, `rgba(236,139,68,${.8 * glow})`);
    g.addColorStop(.38, `rgba(171,58,39,${.32 * glow})`);
    g.addColorStop(1, 'rgba(171,58,39,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(ex, ey, s * .13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPatina(x, y, s, reveal) {
  ctx.save();
  ctx.globalAlpha = reveal * .26;
  ctx.fillStyle = '#d7b66d';
  for (let i = 0; i < 52; i++) {
    const a = i * 12.989 + 0.3;
    const r = (Math.sin(i * 88.7) * .5 + .5) * s * .36;
    const px = x + Math.cos(a) * r * .74;
    const py = y + Math.sin(a * 1.7) * r;
    if (ctx.isPointInPath(maskPath(), px, py)) {
      ctx.beginPath();
      ctx.arc(px, py, rand(1, 3.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function updateParticles() {
  const mx = mouse.x;
  const my = mouse.y;
  const pressure = mouse.down ? 1.6 : 1;
  const c = maskCenter();
  for (const p of particles) {
    const dx = p.x - mx;
    const dy = p.y - my;
    const d2 = dx * dx + dy * dy;
    const radius = 92 * pressure;
    if (d2 < radius * radius) {
      const d = Math.sqrt(d2) || 1;
      const force = (1 - d / radius) * pressure;
      p.vx += (dx / d) * force * 2.25;
      p.vy += (dy / d) * force * 2.25;
      maskReveal = Math.min(.62, maskReveal + force * .0014);
      awakening = Math.min(100, awakening + force * .014);
    }

    const wind = Math.sin(t * .004 + p.seed) * .012 + Math.cos(t * .002 + p.y * .006) * .018;
    p.vx += wind;
    p.vy += Math.sin(t * .003 + p.seed * .7) * .006;

    p.vx += (p.ox - p.x) * p.drift;
    p.vy += (p.oy - p.y) * p.drift;

    const toCenter = Math.hypot(p.x - c.x, p.y - c.y);
    if (toCenter < c.s * .45 && awakening > 20) {
      p.vy -= .006 * Math.min(1, awakening / 100);
    }

    p.vx *= .92;
    p.vy *= .92;
    p.x += p.vx;
    p.y += p.vy;
  }
}

function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  for (const p of particles) {
    const shimmer = .8 + Math.sin(t * .018 + p.seed) * .2;
    ctx.fillStyle = `rgba(${p.color},${p.a * shimmer})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function ignite(x, y, power = 1) {
  awakening = Math.min(100, awakening + 9 * power);
  document.body.classList.add('awake');
  for (let i = 0; i < 60 * power; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(1, 6) * power;
    sparks.push({
      x, y,
      vx: Math.cos(a) * sp + rand(-.6, .6),
      vy: Math.sin(a) * sp - rand(.5, 2.5),
      life: rand(40, 110),
      max: 110,
      r: rand(1, 3.8),
      color: Math.random() < .6 ? '232,164,87' : '151,55,42'
    });
  }
}

function updateSparks() {
  for (const s of sparks) {
    s.vx *= .97;
    s.vy = s.vy * .965 + .025;
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 1.8;
  }
  sparks = sparks.filter(s => s.life > 0);
}

function drawSparks() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of sparks) {
    const a = Math.max(0, s.life / s.max);
    ctx.fillStyle = `rgba(${s.color},${a * .85})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function createWave(x, y, strength = 1) {
  waves.push({ x, y, r: 12, a: .55, strength });
  awakening = Math.min(100, awakening + 3 * strength);
}

function updateWaves() {
  for (const w of waves) {
    w.r += 7 * w.strength;
    w.a *= .94;
    for (const p of particles) {
      const dx = p.x - w.x;
      const dy = p.y - w.y;
      const d = Math.hypot(dx, dy) || 1;
      if (Math.abs(d - w.r) < 16) {
        const f = (1 - Math.abs(d - w.r) / 16) * .38 * w.strength;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }
  }
  waves = waves.filter(w => w.a > .02 && w.r < Math.max(W, H) * 1.2);
}

function drawWaves() {
  ctx.save();
  ctx.strokeStyle = 'rgba(103,56,42,.32)';
  ctx.lineWidth = 1;
  for (const w of waves) {
    ctx.globalAlpha = w.a;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCracks() {
  const { s } = maskCenter();
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const crack of cracks) {
    if (crack.points.length < 2) continue;
    ctx.globalAlpha = crack.alpha;
    ctx.strokeStyle = crack.fire ? 'rgba(218,104,58,.72)' : 'rgba(48,36,27,.5)';
    ctx.lineWidth = crack.fire ? s * .006 : s * .0038;
    ctx.beginPath();
    ctx.moveTo(crack.points[0].x, crack.points[0].y);
    for (let i = 1; i < crack.points.length; i++) ctx.lineTo(crack.points[i].x, crack.points[i].y);
    ctx.stroke();
    ctx.globalAlpha = crack.alpha * .55;
    ctx.strokeStyle = 'rgba(239,171,89,.34)';
    ctx.lineWidth = s * .012;
    ctx.stroke();
    crack.alpha = Math.min(1, crack.alpha + .012);
  }
  ctx.restore();
}

function isNearMask(x, y) {
  const { x: cx, y: cy, s } = maskCenter();
  return Math.hypot(x - cx, y - cy) < s * .38;
}

function animate() {
  t += 1;
  drawBackground();
  updateWaves();
  updateParticles();
  drawMask();
  drawCracks();
  drawWaves();
  updateSparks();
  drawParticles();
  drawSparks();

  if (mouse.down && performance.now() - holdStart > 420) {
    if (t % 24 === 0) createWave(mouse.x, mouse.y, .85);
  }

  if (awakening > 72 && embers.length === 0) scatterEmbers();
  requestAnimationFrame(animate);
}

function scatterEmbers() {
  const c = maskCenter();
  for (let i = 0; i < 120; i++) {
    const a = rand(0, Math.PI * 2);
    const r = rand(0, c.s * .34);
    setTimeout(() => ignite(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r * .8, .16), i * 9);
  }
  embers.push(1);
  guide.textContent = '旧火已醒。停一会儿，尘会重新落回面具上。';
}

window.addEventListener('resize', resize);

window.addEventListener('pointermove', e => {
  mouse.px = mouse.x;
  mouse.py = mouse.y;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.moved = true;

  if (mouse.down && isNearMask(mouse.x, mouse.y)) {
    dragPath.push({ x: mouse.x, y: mouse.y });
    if (dragPath.length > 2 && dragPath.length % 4 === 0) awakening = Math.min(100, awakening + .4);
  }
});

window.addEventListener('pointerdown', e => {
  mouse.down = true;
  holdStart = performance.now();
  dragPath = [{ x: e.clientX, y: e.clientY }];
  if (isNearMask(e.clientX, e.clientY)) ignite(e.clientX, e.clientY, .75);
});

window.addEventListener('pointerup', e => {
  mouse.down = false;
  if (dragPath.length > 5 && isNearMask(e.clientX, e.clientY)) {
    cracks.push({ points: dragPath.slice(), alpha: .05, fire: Math.random() < .5 || awakening > 35 });
  } else if (performance.now() - holdStart < 260) {
    ignite(e.clientX, e.clientY, .55);
  }
  dragPath = [];
});

window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    const c = maskCenter();
    createWave(c.x, c.y, 1.1);
    ignite(c.x, c.y - c.s * .08, .28);
  }
});

resize();
animate();
