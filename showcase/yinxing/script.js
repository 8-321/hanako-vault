const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
const statusLine = document.getElementById('statusLine');
const hintLine = document.querySelector('.hint-line');
const webcam = document.getElementById('webcam');

let W = 0;
let H = 0;
let dpr = 1;
let scene, camera, root, particles, particleGeo, particleMat, ringGroup;
let spriteTex;
let targetMorph = 1.0;
let morph = 1.0;
let targetRotX = 0;
let targetRotY = 0;
let rotX = 0;
let rotY = 0;
let targetZoom = 1;
let zoom = 1;
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
let pointerPulse = 0;
let tick = 0;
let mode = 'mouse';
let gesture = {
  open: 0.45,
  pinch: 0.65,
  centerX: 0.5,
  centerY: 0.5,
  hasHand: false
};

const COUNT = 4200;
const particlesData = [];
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const scales = new Float32Array(COUNT);

const palette = [
  new THREE.Color('#cfe2cf'),
  new THREE.Color('#9dbb98'),
  new THREE.Color('#6d8f67'),
  new THREE.Color('#3e5e3b'),
  new THREE.Color('#2a4628'),
  new THREE.Color('#eaf4e7')
];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(a, b, t) { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
function hash(n) { return (Math.sin(n * 1e4) * 43758.5453123) % 1; }
function fract(n) { return n - Math.floor(n); }
function randFrom(seed, offset = 0) { return fract(Math.sin(seed * 999.123 + offset * 53.73) * 43758.5453); }

function updateStatus(text) {
  statusLine.textContent = text;
  document.body.classList.toggle('gesture', mode === 'gesture');
}

function makeSpriteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(.2, 'rgba(232,248,230,.92)');
  grad.addColorStop(.45, 'rgba(139,182,130,.38)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildShapeSamples(type) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 512);
  g.translate(256, 256);

  if (type === 'heart') drawHeartShape(g);
  if (type === 'tree') drawTreeShape(g);
  if (type === 'flower') drawFlowerShape(g);

  const data = g.getImageData(0, 0, 512, 512).data;
  const pts = [];
  for (let y = 0; y < 512; y += 3) {
    for (let x = 0; x < 512; x += 3) {
      const idx = (y * 512 + x) * 4 + 3;
      const a = data[idx];
      if (a > 15) pts.push({
        x: (x - 256) / 256,
        y: (256 - y) / 256,
        z: a / 255
      });
    }
  }
  return { canvas: c, points: pts };
}

function drawHeartShape(g) {
  g.save();
  g.translate(0, 14);
  const h = new Path2D();
  h.moveTo(0, 138);
  h.bezierCurveTo(-88, 96, -186, -32, 0, -122);
  h.bezierCurveTo(186, -32, 88, 96, 0, 138);

  const grad = g.createRadialGradient(-30, -18, 18, 0, 30, 190);
  grad.addColorStop(0, 'rgba(212,234,206,.98)');
  grad.addColorStop(.45, 'rgba(118,168,108,.84)');
  grad.addColorStop(1, 'rgba(38,68,40,.94)');
  g.fillStyle = grad;
  g.fill(h);
  g.strokeStyle = 'rgba(30,54,32,.42)';
  g.lineWidth = 10;
  g.stroke(h);

  g.lineWidth = 3;
  g.strokeStyle = 'rgba(178,216,162,.38)';
  g.beginPath();
  g.moveTo(-72, 52);
  g.quadraticCurveTo(0, 28, 72, 52);
  g.stroke();
  g.restore();
}

function drawTreeShape(g) {
  g.save();
  g.translate(0, 46);

  const canopy = new Path2D();
  canopy.arc(0, -94, 108, 0, Math.PI * 2);
  const gradC = g.createRadialGradient(-22, -110, 20, 0, -40, 140);
  gradC.addColorStop(0, 'rgba(196,228,186,.96)');
  gradC.addColorStop(.42, 'rgba(88,138,74,.86)');
  gradC.addColorStop(1, 'rgba(30,54,32,.92)');
  g.fillStyle = gradC;
  g.fill(canopy);
  g.strokeStyle = 'rgba(26,48,28,.38)';
  g.lineWidth = 8;
  g.stroke(canopy);

  g.fillStyle = 'rgba(48,74,44,.88)';
  g.fillRect(-16, 26, 32, 72);

  g.strokeStyle = 'rgba(202,228,190,.28)';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(-52, -34);
  g.quadraticCurveTo(0, -88, 52, -34);
  g.stroke();
  g.restore();
}

function drawFlowerShape(g) {
  g.save();
  g.translate(0, 2);

  const petalGrad = g.createRadialGradient(0, 0, 12, 0, 0, 190);
  petalGrad.addColorStop(0, 'rgba(240,248,232,.98)');
  petalGrad.addColorStop(.36, 'rgba(152,194,138,.88)');
  petalGrad.addColorStop(1, 'rgba(42,74,42,.92)');
  g.fillStyle = petalGrad;
  g.strokeStyle = 'rgba(32,56,34,.36)';
  g.lineWidth = 7;

  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    const cx = Math.cos(a) * 92;
    const cy = Math.sin(a) * 92;
    g.beginPath();
    g.ellipse(cx, cy, 54, 76, a + Math.PI / 2, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }

  g.fillStyle = 'rgba(232,248,226,.92)';
  g.strokeStyle = 'rgba(56,86,48,.32)';
  g.lineWidth = 5;
  g.beginPath();
  g.arc(0, 0, 36, 0, Math.PI * 2);
  g.fill();
  g.stroke();

  g.restore();
}

function shapePoint(samples, seed) {
  const idx = Math.floor(randFrom(seed, 0.3) * samples.length) % samples.length;
  return samples[idx] || samples[0];
}

let samples;
let hands = null;
let cameraFeed = null;

function buildSamples() {
  samples = {
    heart: buildShapeSamples('heart').points,
    tree: buildShapeSamples('tree').points,
    flower: buildShapeSamples('flower').points
  };
}

function initParticles() {
  for (let i = 0; i < COUNT; i++) {
    const seed = Math.random() * 9999;
    const hue = palette[(Math.random() * palette.length) | 0];
    particlesData.push({
      seed,
      current: new THREE.Vector3(
        (Math.random() - .5) * 8,
        (Math.random() - .5) * 5,
        (Math.random() - .5) * 5
      ),
      target: new THREE.Vector3(),
      wobble: randFrom(seed, 7.1) * Math.PI * 2,
      sway: randFrom(seed, 4.7) * .2 + .03,
      zBias: randFrom(seed, 2.2) * 1.7 - .85,
      size: randFrom(seed, 8.4) * .55 + .35,
      color: hue.clone().offsetHSL(randFrom(seed, 5.5) * .07 - .03, randFrom(seed, 2.8) * .1 - .04, randFrom(seed, 1.2) * .05 - .02),
      drift: new THREE.Vector3((Math.random() - .5) * .01, (Math.random() - .5) * .01, (Math.random() - .5) * .01)
    });
  }
}

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#c8d9c4');
  scene.fog = new THREE.FogExp2('#c5d7c2', 0.078);

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 8.8);

  root = new THREE.Group();
  scene.add(root);

  ringGroup = new THREE.Group();
  root.add(ringGroup);

  const ringMat = new THREE.LineBasicMaterial({ color: 0x7dad80, transparent: true, opacity: 0.18 });
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.BufferGeometry();
    const pts = [];
    const radius = 2.6 + i * 0.75;
    const seg = 160;
    for (let s = 0; s <= seg; s++) {
      const a = (s / seg) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, Math.sin(a) * radius * (i === 1 ? 0.78 : 0.92), 0);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, ringMat);
    line.rotation.x = i * 0.48 + 0.2;
    line.rotation.y = i * 0.15;
    ringGroup.add(line);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.setAttribute('size', new THREE.BufferAttribute(scales, 1));
  particleGeo = geom;

  spriteTex = makeSpriteTexture();
  particleMat = new THREE.PointsMaterial({
    map: spriteTex,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    size: 0.065,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.95
  });
  particles = new THREE.Points(geom, particleMat);
  root.add(particles);
}

function initParticleBuffer() {
  for (let i = 0; i < COUNT; i++) {
    const p = particlesData[i];
    const c = p.color;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    scales[i] = p.size;
    positions[i * 3] = p.current.x;
    positions[i * 3 + 1] = p.current.y;
    positions[i * 3 + 2] = p.current.z;
  }
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H, false);
  if (camera) {
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
}

function targetFromSample(sample, stateIdx, particle) {
  const base = 3.2;
  const x = sample.x * base;
  const y = sample.y * base;
  const zNoise = (randFrom(particle.seed, 13.3 + stateIdx * 4.1) - .5) * 1.7;
  let z = zNoise;

  if (stateIdx === 0) { // heart
    z += sample.z * 1.1;
  }
  if (stateIdx === 1) { // tree
    z += sample.z * 1.3 + Math.max(0, sample.y) * .7;
  }
  if (stateIdx === 2) { // flower
    z += (1 - Math.hypot(sample.x, sample.y)) * .8 + sample.z * .4;
  }

  return new THREE.Vector3(x, y, z);
}

function computeStateTarget(particle, morphValue) {
  const state = clamp(morphValue, 0, 2);
  const f = fract(particle.seed * 0.618033);
  const g = fract(particle.seed * 0.414214 + 0.17);
  const h = fract(particle.seed * 0.271828 + 0.31);

  const sampleHeart = shapePoint(samples.heart, particle.seed + 1.13);
  const sampleTree = shapePoint(samples.tree, particle.seed + 5.27);
  const sampleFlower = shapePoint(samples.flower, particle.seed + 9.71);

  const a = targetFromSample(sampleHeart, 0, particle);
  const b = targetFromSample(sampleTree, 1, particle);
  const c = targetFromSample(sampleFlower, 2, particle);

  let res;
  if (state < 1) res = a.lerp(b, state);
  else res = b.lerp(c, state - 1);

  // give each particle an orbiting offset so the field feels alive
  const swirl = new THREE.Vector3(
    Math.cos(tick * 0.01 + particle.wobble) * .08 * (1 + h),
    Math.sin(tick * 0.008 + particle.wobble * 1.2) * .07 * (1 + g),
    Math.sin(tick * 0.006 + particle.wobble * .9) * .06 * (1 + f)
  );

  res.add(swirl);
  return res;
}

function integratePointerMode() {
  if (!mouseDown) {
    targetRotY = lerp(targetRotY, (mouseX / W - .5) * 1.65, .04);
    targetRotX = lerp(targetRotX, (mouseY / H - .5) * -1.05, .04);
    targetMorph = lerp(targetMorph, 1 + (mouseY / H - .5) * 0.9, .03);
  } else {
    targetRotY = lerp(targetRotY, (mouseX / W - .5) * 2.0, .06);
    targetRotX = lerp(targetRotX, (mouseY / H - .5) * -1.25, .06);
    targetMorph = lerp(targetMorph, 1 + (0.5 - mouseY / H) * 1.8, .08);
  }
  targetMorph = clamp(targetMorph, 0, 2);
  targetZoom = lerp(targetZoom, 1 + ((1 - mouseY / H) - .5) * .22, .03);
}

function integrateGestureMode() {
  if (!gesture.hasHand) {
    mode = 'mouse';
    updateStatus('mouse mode · drag to rotate · wheel to open / close');
    return;
  }
  mode = 'gesture';
  updateStatus(`gesture mode · open:${gesture.open.toFixed(2)} pinch:${gesture.pinch.toFixed(2)}`);
  targetMorph = clamp(gesture.open * 2, 0, 2);
  targetRotY = lerp(targetRotY, (gesture.centerX - .5) * 1.9, .08);
  targetRotX = lerp(targetRotX, (gesture.centerY - .5) * -1.2, .08);
  targetZoom = lerp(targetZoom, 1 + (1 - gesture.pinch) * .42, .04);
}

function animateParticles() {
  const focus = 0.85 + (1 - gesture.pinch) * .65;
  for (let i = 0; i < COUNT; i++) {
    const p = particlesData[i];
    const target = computeStateTarget(p, morph);
    p.current.x = lerp(p.current.x, target.x, 0.045);
    p.current.y = lerp(p.current.y, target.y, 0.045);
    p.current.z = lerp(p.current.z, target.z, 0.045);

    // attract to center gently, giving a living cloud feel
    const centerPull = 0.0004 + pointerPulse * 0.00003;
    p.current.x += (0 - p.current.x) * centerPull;
    p.current.y += (0 - p.current.y) * centerPull * 1.1;
    p.current.z += (0 - p.current.z) * centerPull * 0.9;

    positions[i * 3] = p.current.x;
    positions[i * 3 + 1] = p.current.y;
    positions[i * 3 + 2] = p.current.z;

    const flicker = 0.88 + Math.sin(tick * 0.02 + p.wobble) * 0.12;
    scales[i] = p.size * focus * flicker;
  }
  particleGeo.attributes.position.needsUpdate = true;
  particleGeo.attributes.size.needsUpdate = true;
}

function updateRingGroup() {
  ringGroup.rotation.x = rotX * 0.5;
  ringGroup.rotation.y = rotY * 0.7;
  ringGroup.rotation.z = Math.sin(tick * 0.002) * 0.03;
}

function renderLoop() {
  tick += 1;
  if (mode === 'gesture') integrateGestureMode(); else integratePointerMode();

  morph = lerp(morph, targetMorph, 0.07);
  rotX = lerp(rotX, targetRotX, 0.05);
  rotY = lerp(rotY, targetRotY, 0.05);
  zoom = lerp(zoom, targetZoom, 0.03);

  updateRingGroup();

  root.rotation.x = rotX;
  root.rotation.y = rotY;
  root.rotation.z = Math.sin(tick * 0.0018) * 0.04;
  camera.position.z = 8.8 / zoom;

  animateParticles();
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

function burst(x, y, strength = 1) {
  pointerPulse = Math.min(1, pointerPulse + strength * 0.35);
  for (let i = 0; i < 80 * strength; i++) {
    const p = particlesData[(Math.random() * COUNT) | 0];
    const dir = new THREE.Vector3(
      (Math.random() - .5) * 2,
      (Math.random() - .5) * 2,
      (Math.random() - .5) * 2
    ).normalize().multiplyScalar(0.4 + Math.random() * 0.8 * strength);
    p.current.add(dir);
  }
  statusLine.textContent = mode === 'gesture'
    ? `gesture mode · open:${gesture.open.toFixed(2)} pinch:${gesture.pinch.toFixed(2)} · pulse`
    : 'mouse mode · pulse';
}

function updateGestureFromLandmarks(landmarks) {
  const pts = landmarks;
  const wrist = pts[0];
  const idxMCP = pts[5];
  const midMCP = pts[9];
  const ringMCP = pts[13];
  const pinkyMCP = pts[17];
  const palmSize = Math.hypot(idxMCP.x - pinkyMCP.x, idxMCP.y - pinkyMCP.y) + 0.0001;

  const fingerTips = [8, 12, 16, 20].map(i => Math.hypot(pts[i].x - wrist.x, pts[i].y - wrist.y));
  const openRaw = fingerTips.reduce((a, b) => a + b, 0) / fingerTips.length / palmSize;
  const pinchRaw = Math.hypot(pts[4].x - pts[8].x, pts[4].y - pts[8].y) / palmSize;
  const centerX = (wrist.x + idxMCP.x + midMCP.x + ringMCP.x + pinkyMCP.x) / 5;
  const centerY = (wrist.y + idxMCP.y + midMCP.y + ringMCP.y + pinkyMCP.y) / 5;

  gesture.open = lerp(gesture.open, clamp((openRaw - 0.85) / 1.0, 0, 1), 0.24);
  gesture.pinch = lerp(gesture.pinch, clamp(1 - pinchRaw * 1.8, 0, 1), 0.2);
  gesture.centerX = lerp(gesture.centerX, centerX, 0.22);
  gesture.centerY = lerp(gesture.centerY, centerY, 0.22);
  gesture.hasHand = true;

  const openness = gesture.open;
  if (openness > 0.82 && tick % 18 === 0) {
    burst((centerX - .5) * 2, (centerY - .5) * 2, 0.3);
  }
}

async function initHands() {
  if (!navigator.mediaDevices?.getUserMedia || typeof Hands === 'undefined' || typeof Camera === 'undefined') {
    updateStatus('mouse mode · drag to rotate · wheel to open / close');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    webcam.srcObject = stream;
    await webcam.play();

    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
      selfieMode: true,
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.62
    });
    hands.onResults((results) => {
      gesture.hasHand = false;
      if (results.multiHandLandmarks && results.multiHandLandmarks.length) {
        updateGestureFromLandmarks(results.multiHandLandmarks[0]);
        mode = 'gesture';
      }
    });

    cameraFeed = new Camera(webcam, {
      width: 640,
      height: 480,
      onFrame: async () => {
        if (hands) await hands.send({ image: webcam });
      }
    });
    cameraFeed.start();
    mode = 'gesture';
    updateStatus('gesture mode · camera ready');
  } catch (err) {
    mode = 'mouse';
    updateStatus('mouse mode · camera unavailable');
  }
}

function buildScene() {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0xc5d7c2, 1);

  initThree();
  buildSamples();
  initParticles();
  initParticleBuffer();
  resize();
  renderLoop();
  initHands();
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (mouseDown) {
    targetMorph = clamp(1 + (0.5 - mouseY / H) * 2, 0, 2);
    burst(e.clientX / W - .5, e.clientY / H - .5, 0.04);
  }
});
window.addEventListener('pointerdown', (e) => {
  mouseDown = true;
  burst(e.clientX / W - .5, e.clientY / H - .5, 0.2);
});
window.addEventListener('pointerup', () => {
  mouseDown = false;
  pointerPulse = 0;
});
window.addEventListener('wheel', (e) => {
  targetMorph = clamp(targetMorph + Math.sign(e.deltaY) * -0.22, 0, 2);
  updateStatus(`mouse mode · morph ${targetMorph.toFixed(2)} · drag to rotate`);
}, { passive: true });
window.addEventListener('keydown', (e) => {
  if (e.key === '1') targetMorph = 0;
  if (e.key === '2') targetMorph = 1;
  if (e.key === '3') targetMorph = 2;
  if (e.code === 'Space') {
    e.preventDefault();
    burst(0, 0, 0.75);
  }
});

buildScene();
