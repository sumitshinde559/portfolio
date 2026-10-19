// Night-time campaign world drawn with Three.js.
// An email, a landing page, a form and a CRM float in the dark under a red moon,
// joined by a line of glowing "leads". The camera flies through them as the page scrolls.
import * as THREE from 'three';

const canvas = document.getElementById('scene');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
  throw e;
}
document.documentElement.classList.add('has-webgl');

const NIGHT = 0x0a0b10, BONE = 0xece8e1, RED = 0xe0231c, EMBER = 0xff5a3c, PANEL = 0x1a1d27;

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setClearColor(NIGHT, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(NIGHT, 0.042);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 220);
camera.position.set(0, 0.6, 10);

/* ---------- Light ---------- */
scene.add(new THREE.HemisphereLight(0x8a93b8, NIGHT, 0.55));
const moonLight = new THREE.DirectionalLight(0xff7a62, 2.2);
moonLight.position.set(8, 9, -6);
scene.add(moonLight);
const rim = new THREE.DirectionalLight(0x8aa0ff, 0.5);
rim.position.set(-8, 3, 6);
scene.add(rim);

/* ---------- Helpers ---------- */
function canvasTexture(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const mat = {
  bone: new THREE.MeshStandardMaterial({ color: BONE, roughness: 0.55, metalness: 0.05 }),
  red: new THREE.MeshStandardMaterial({ color: RED, roughness: 0.4, emissive: RED, emissiveIntensity: 0.35 }),
  panel: new THREE.MeshStandardMaterial({ color: PANEL, roughness: 0.7, metalness: 0.2 }),
  ink: new THREE.MeshStandardMaterial({ color: 0x2a2e3b, roughness: 0.8 }),
  glow: new THREE.MeshBasicMaterial({ color: EMBER }),
};
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

/* ---------- Moon ---------- */
const moonTex = canvasTexture(512, (g, s) => {
  const grd = g.createRadialGradient(s * 0.42, s * 0.4, s * 0.05, s / 2, s / 2, s / 2);
  grd.addColorStop(0, '#ff6b55'); grd.addColorStop(0.6, '#c92a20'); grd.addColorStop(1, '#7a1410');
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * s, y = Math.random() * s, r = 4 + Math.random() * 38;
    const c = g.createRadialGradient(x, y, 0, x, y, r);
    c.addColorStop(0, 'rgba(60,8,6,0.45)'); c.addColorStop(1, 'rgba(60,8,6,0)');
    g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
});
const moon = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), new THREE.MeshBasicMaterial({ map: moonTex, fog: false }));
moon.position.set(14, 11, -60);
scene.add(moon);
const glowTex = canvasTexture(256, (g, s) => {
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,70,50,0.55)'); grd.addColorStop(0.35, 'rgba(224,35,28,0.18)'); grd.addColorStop(1, 'rgba(224,35,28,0)');
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
});
const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
moonGlow.scale.set(46, 46, 1);
moonGlow.position.copy(moon.position).add(new THREE.Vector3(0, 0, 1));
scene.add(moonGlow);

/* ---------- Stars ---------- */
{
  const n = 1100, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 80 + Math.random() * 60, th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.45;
    pos[i * 3] = r * Math.cos(th) * Math.sin(ph) * 1.6;
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.7 + 4;
    pos[i * 3 + 2] = r * Math.sin(th) * Math.sin(ph) - 40;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: BONE, size: 0.22, sizeAttenuation: true, transparent: true, opacity: 0.7, fog: false })));
}

/* ---------- Ground: low-poly night hills ---------- */
{
  const g = new THREE.PlaneGeometry(240, 240, 90, 90);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const valley = Math.min(1, Math.abs(x) / 9); // keep a clear valley for the camera path
    const h = (Math.sin(x * 0.18) * Math.cos(z * 0.14) * 1.6 + Math.sin(x * 0.05 + z * 0.07) * 3.2 + Math.random() * 0.35) * valley;
    p.setY(i, h);
  }
  g.computeVertexNormals();
  const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x141826, roughness: 1, flatShading: true }));
  ground.position.y = -3.4;
  scene.add(ground);
}

/* ---------- The four campaign objects ---------- */
function envelope() {
  const grp = new THREE.Group();
  grp.add(box(2.6, 1.7, 0.1, mat.bone));
  const flap = new THREE.Shape();
  flap.moveTo(-1.3, 0); flap.lineTo(1.3, 0); flap.lineTo(0, -1.05); flap.lineTo(-1.3, 0);
  const f = new THREE.Mesh(new THREE.ExtrudeGeometry(flap, { depth: 0.04, bevelEnabled: false }), mat.red);
  f.position.set(0, 0.85, 0.06);
  grp.add(f);
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 32), mat.glow);
  seal.rotation.x = Math.PI / 2; seal.position.set(0, -0.2, 0.12);
  grp.add(seal);
  // greeting line + body lines on the letter edge
  const l = box(1.2, 0.07, 0.02, mat.ink); l.position.set(-0.45, -0.55, 0.06); grp.add(l);
  return grp;
}
function landingPage() {
  const grp = new THREE.Group();
  grp.add(box(3.2, 2.1, 0.1, mat.panel));
  const bar = box(3.2, 0.24, 0.12, mat.bone); bar.position.y = 0.93; grp.add(bar);
  [-1.38, -1.2, -1.02].forEach((x) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), mat.red); d.position.set(x, 0.93, 0.08); grp.add(d);
  });
  const hero = box(1.7, 0.26, 0.04, mat.bone); hero.position.set(-0.55, 0.45, 0.07); grp.add(hero);
  for (let i = 0; i < 3; i++) { const t = box(1.3 - i * 0.2, 0.07, 0.03, mat.ink); t.position.set(-0.75 + i * 0.1, 0.1 - i * 0.18, 0.07); grp.add(t); }
  const btn = box(0.8, 0.26, 0.08, mat.red); btn.position.set(-1.0, -0.6, 0.08); grp.add(btn);
  const img = box(1.05, 1.2, 0.05, mat.ink); img.position.set(0.92, -0.15, 0.07); grp.add(img);
  return grp;
}
function form() {
  const grp = new THREE.Group();
  grp.add(box(2.1, 2.7, 0.1, mat.bone));
  for (let i = 0; i < 3; i++) {
    const lab = box(0.6, 0.06, 0.02, mat.ink); lab.position.set(-0.45, 0.95 - i * 0.55, 0.06); grp.add(lab);
    const field = box(1.6, 0.24, 0.04, mat.panel); field.position.set(0, 0.75 - i * 0.55, 0.07); grp.add(field);
  }
  const btn = box(1.6, 0.3, 0.08, mat.red); btn.position.set(0, -0.95, 0.08); grp.add(btn);
  return grp;
}
function crm() {
  const grp = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.52, 48), mat.panel);
    c.position.y = (i - 1) * 0.66; grp.add(c);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.03, 8, 64), mat.glow);
    ring.rotation.x = Math.PI / 2; ring.position.y = (i - 1) * 0.66 + 0.3; grp.add(ring);
  }
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.04, 48), mat.bone);
  lid.position.y = 0.96; grp.add(lid);
  return grp;
}

const stations = [
  { make: envelope, pos: [3.0, 0.9, 2.5], rot: -0.35 },
  { make: landingPage, pos: [-3.1, 0.4, -6.5], rot: 0.4 },
  { make: form, pos: [3.2, 0.2, -15.5], rot: -0.4 },
  { make: crm, pos: [-3.0, 0.0, -24.5], rot: 0.3 },
].map((s, i) => {
  const outer = new THREE.Group();
  const inner = s.make();
  outer.add(inner);
  outer.position.set(...s.pos);
  inner.rotation.y = s.rot;
  scene.add(outer);
  return { outer, inner, base: s.pos[1], rot: s.rot, phase: i * 1.7 };
});

/* ---------- Lead flow between them ---------- */
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(6, 2.5, 9),
  ...stations.map((s) => s.outer.position.clone()),
  new THREE.Vector3(1, -0.5, -34),
]);
scene.add(new THREE.Mesh(
  new THREE.TubeGeometry(curve, 300, 0.018, 6, false),
  new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.55 })
));
const leads = [];
for (let i = 0; i < 18; i++) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), mat.glow);
  scene.add(m);
  leads.push({ m, off: i / 18 });
}

/* ---------- Falling red petals ---------- */
const PETALS = window.innerWidth < 640 ? 120 : 240;
const petalGeo = new THREE.PlaneGeometry(0.14, 0.08);
const petals = new THREE.InstancedMesh(petalGeo, new THREE.MeshBasicMaterial({ color: RED, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), PETALS);
const pd = [];
for (let i = 0; i < PETALS; i++) {
  pd.push({
    x: (Math.random() - 0.5) * 30, y: Math.random() * 14 - 3, z: 12 - Math.random() * 46,
    vy: 0.006 + Math.random() * 0.012, sway: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.06,
    rx: Math.random() * 6, ry: Math.random() * 6,
  });
}
scene.add(petals);
const dummy = new THREE.Object3D();
function updatePetals(t, step) {
  for (let i = 0; i < PETALS; i++) {
    const p = pd[i];
    if (step) {
      p.y -= p.vy; p.x += Math.sin(t * 0.7 + p.sway) * 0.006; p.rx += p.spin; p.ry += p.spin * 0.7;
      if (p.y < -3.5) { p.y = 10 + Math.random() * 3; p.x = (Math.random() - 0.5) * 30; }
    }
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(p.rx, p.ry, 0);
    dummy.updateMatrix();
    petals.setMatrixAt(i, dummy.matrix);
  }
  petals.instanceMatrix.needsUpdate = true;
}

/* ---------- Camera: scroll + pointer ---------- */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}
let camZ = 10, camX = 0;
const lookTarget = new THREE.Vector3();

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // On narrow screens pull back so the objects stay in frame.
  camera.fov = w < 700 ? 62 : 48;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
let running = true;
document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (running && !reduceMotion) { clock.getDelta(); requestAnimationFrame(frame); }
});

function place(t, step) {
  const p = scrollProgress();
  const ease = reduceMotion || !step ? 1 : 0.07;
  pointer.x += (pointer.tx - pointer.x) * 0.05;
  pointer.y += (pointer.ty - pointer.y) * 0.05;
  const targetZ = 10 - p * 36;
  const targetX = Math.sin(p * Math.PI * 2.2) * 1.4;
  camZ += (targetZ - camZ) * ease;
  camX += (targetX - camX) * ease;
  camera.position.set(camX + pointer.x * 0.7, 0.7 - p * 0.5 - pointer.y * 0.35, camZ);
  lookTarget.set(camX * 0.35, 0.1, camZ - 9);
  camera.lookAt(lookTarget);

  stations.forEach((s) => {
    s.outer.position.y = s.base + (step ? Math.sin(t * 0.9 + s.phase) * 0.16 : 0);
    s.inner.rotation.y = s.rot + Math.sin(t * 0.35 + s.phase) * 0.22 + pointer.x * 0.15;
    s.inner.rotation.x = Math.sin(t * 0.5 + s.phase) * 0.06 - pointer.y * 0.08;
  });
  leads.forEach((l) => { l.m.position.copy(curve.getPointAt((t * 0.025 + l.off) % 1)); });
  moon.rotation.y = t * 0.01;
  updatePetals(t, step);
}

function frame() {
  if (!running) return;
  const t = clock.getElapsedTime();
  place(t, true);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

if (reduceMotion) {
  // Still frame, re-drawn only when the visitor scrolls or resizes.
  const still = () => { place(0, false); renderer.render(scene, camera); };
  window.addEventListener('scroll', still, { passive: true });
  window.addEventListener('resize', still);
  still();
} else {
  requestAnimationFrame(frame);
}
