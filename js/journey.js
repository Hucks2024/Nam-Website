/* Bontà: the 3D walk-in.
   A small model of the restaurant, built here in code from its own look (terracotta and cream front,
   green arched windows, the canopy and glowing sign, yellow dining room, quatrefoil floor tiles and
   the lantern skylight). Scrolling moves a camera along a path: up to the front, through the doors,
   round the photos on the walls, then up into the lanterns as the page takes over.

   Loaded by js/fx.js only when <head> decided the browser can draw it (html.journey).
   If anything here fails, fx.js removes that class and the ordinary top screen is shown instead.

   The photos on the walls are the ones in the page: the food list (.dish) hangs on the side walls and
   the "made by hand" three (.made__list) sit in the arches on the back wall. Add a dish to index.html
   and it gets a frame here too. */
import * as THREE from './vendor/three.module.min.js';

const root = document.documentElement;
const hero = document.querySelector('.hero');
const stage = document.querySelector('.hero__stage');
const canvas = document.querySelector('.tour__canvas');
if (!hero || !stage || !canvas) throw new Error('tour: markup missing');

const FORCED = new URLSearchParams(location.search).get('3d') === '1';

/* ---------- Little helpers ---------- */
const V3 = THREE.Vector3;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
// A fixed random sequence, so the model is identical on every visit.
let seed = 20260822;
const rnd = () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rr = (a, b) => a + (b - a) * rnd();
const pick = (list) => list[Math.floor(rnd() * list.length)];

/* ---------- Renderer ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;
let dpr = Math.min(window.devicePixelRatio || 1, smallScreen ? 1.75 : 2);
renderer.setPixelRatio(dpr);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
const FOG = 0x4a4766;
scene.fog = new THREE.FogExp2(FOG, 0.011);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 700);

/* ---------- The building, in metres ---------- */
const HALF = 8;            // half the width of the front
const DEPTH = 16;
const WALL_H = 4.6;        // outside wall height
const CEIL = 3.9;          // dining-room ceiling
const T = 0.3;             // wall thickness
const SPRING = 2.25;       // where the arches start to curve
const R = 0.95;            // arch radius (openings are 1.9 m wide)
const SILL = 0.5;
const GROUND = -0.15;      // pavement; the terrace and floor are at 0
const IN_X = HALF - T;     // inside face of the side walls
const IN_Z = DEPTH - T;    // inside face of the back wall (at z = -IN_Z)
const OPENINGS = [-5.4, -2.7, 0, 2.7, 5.4];   // the middle one is the door
const SKY = { x: 2.25, z0: -10.6, z1: -4.4, top: 4.75 };   // the lantern skylight

const C = {
  paper: 0xFFFCF4, frame: 0x4F8068, canopy: 0x3C6C58, sage: 0x86A98F,
  wood: 0x9A6A44, darkwood: 0x5A3D2B, leather: 0xC8793F, seatGreen: 0x5E8166, brass: 0xB8935A,
  black: 0x101214, warm: 0xFFB866, bulb: 0xFFE3AE,
  leaves: [0x2F6B3A, 0x3D7D45, 0x4C8A3F, 0x2A5C36, 0x5A9650],
};

/* ---------- Textures drawn on a canvas ---------- */
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
function tex(w, h, draw, repeat = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
  return t;
}
function speckle(g, w, h, count, colors, r0, r1, alpha) {
  for (let i = 0; i < count; i++) {
    g.globalAlpha = alpha * rr(0.4, 1);
    g.fillStyle = pick(colors);
    g.beginPath(); g.arc(rr(0, w), rr(0, h), rr(r0, r1), 0, 7); g.fill();
  }
  g.globalAlpha = 1;
}

// The green cement tile from the dining-room floor (same drawing as the SVG pattern in index.html).
const texTile = tex(128, 128, (g, w) => {
  const s = w / 44;
  g.fillStyle = '#1F5A4C'; g.fillRect(0, 0, w, w);
  g.fillStyle = '#F2E9D2';
  const flower = (cx, cy) => {
    for (const [dx, dy] of [[-4.6, 0], [4.6, 0], [0, -4.6], [0, 4.6]]) {
      g.beginPath(); g.arc((cx + dx) * s, (cy + dy) * s, 5.4 * s, 0, 7); g.fill();
    }
  };
  flower(22, 22); flower(0, 0); flower(44, 0); flower(0, 44); flower(44, 44);
  g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(0, .5); g.lineTo(w, .5); g.moveTo(.5, 0); g.lineTo(.5, w);
  g.moveTo(0, w / 2); g.lineTo(w, w / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, w); g.stroke();
});

const texTerrazzo = tex(256, 256, (g, w, h) => {
  g.fillStyle = '#EDE3CC'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 900, ['#D8CBAE', '#C9B797', '#FFFFFF', '#BFAE90', '#A9B8A4'], 0.6, 2.2, 0.7);
});

const texPave = tex(256, 256, (g, w, h) => {
  g.fillStyle = '#6F6463'; g.fillRect(0, 0, w, h);
  const n = 4, s = w / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    g.fillStyle = pick(['#8B7B77', '#93827C', '#857672', '#8F7E7B', '#97867F']);
    g.fillRect(x * s + 1.5, y * s + 1.5, s - 3, s - 3);
  }
  speckle(g, w, h, 500, ['#6d605d', '#a39088', '#7c6e6a'], 0.5, 1.6, 0.5);
});

const texTerrace = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#7A3E2C'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    g.fillStyle = pick(['#B25E40', '#A95539', '#B86547', '#AD5A3D']);
    g.fillRect(x * 64 + 1.5, y * 64 + 1.5, 61, 61);
  }
  speckle(g, w, h, 160, ['#8f4a33', '#c47756'], 0.5, 1.8, 0.35);
});

// Outside paint: cream below the arch line, terracotta above. One texture is the full wall height.
const texFacade = tex(256, 256, (g, w, h) => {
  const split = h * (1 - SPRING / WALL_H);
  g.fillStyle = '#A9523C'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#E6D5AE'; g.fillRect(0, split, w, h - split);
  speckle(g, w, split, 500, ['#9c4935', '#b65e46', '#a04c37'], 1, 5, 0.22);
  g.save(); g.beginPath(); g.rect(0, split, w, h - split); g.clip();
  speckle(g, w, h, 600, ['#d9c79d', '#f0e1bd', '#dccaa2'], 1, 5, 0.25);
  g.restore();
  const grime = g.createLinearGradient(0, h * 0.86, 0, h);
  grime.addColorStop(0, 'rgba(60,40,30,0)'); grime.addColorStop(1, 'rgba(60,40,30,.35)');
  g.fillStyle = grime; g.fillRect(0, h * 0.86, w, h * 0.14);
});
texFacade.wrapT = THREE.ClampToEdgeWrapping;
texFacade.repeat.set(1 / 4, 1 / WALL_H);

// Inside paint: butter yellow, a touch darker by the floor and ceiling, with a green skirting board.
const texInterior = tex(256, 256, (g, w, h) => {
  g.fillStyle = '#F2DD9F'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 500, ['#ecd592', '#f7e6b0', '#e9d08b'], 2, 9, 0.2);
  const top = g.createLinearGradient(0, 0, 0, h * 0.2);
  top.addColorStop(0, 'rgba(150,105,40,.28)'); top.addColorStop(1, 'rgba(150,105,40,0)');
  g.fillStyle = top; g.fillRect(0, 0, w, h * 0.2);
  const low = g.createLinearGradient(0, h * 0.62, 0, h);
  low.addColorStop(0, 'rgba(140,95,35,0)'); low.addColorStop(1, 'rgba(140,95,35,.34)');
  g.fillStyle = low; g.fillRect(0, h * 0.62, w, h * 0.38);
  g.fillStyle = '#2B6654'; g.fillRect(0, h * (1 - 0.13 / CEIL), w, h);
});
texInterior.wrapT = THREE.ClampToEdgeWrapping;
texInterior.repeat.set(1 / 3, 1 / CEIL);

const texLantern = tex(64, 128, (g, w, h) => {
  const body = g.createLinearGradient(0, 0, 0, h);
  body.addColorStop(0, '#F4A261'); body.addColorStop(0.3, '#FFE0A8'); body.addColorStop(0.6, '#FFF1CF'); body.addColorStop(1, '#F29A58');
  g.fillStyle = body; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(178,70,38,.8)';
  for (let y = 5; y < h; y += 9) g.fillRect(0, y, w, 2);
  g.fillStyle = 'rgba(178,70,38,.3)';
  for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 1.5, h);
  g.fillStyle = '#9A3F26'; g.fillRect(0, 0, w, 7); g.fillRect(0, h - 7, w, 7);
});

const texSky = tex(8, 512, (g, w, h) => {
  const s = g.createLinearGradient(0, 0, 0, h);
  s.addColorStop(0, '#081726'); s.addColorStop(0.2, '#122a44'); s.addColorStop(0.34, '#2c4168');
  s.addColorStop(0.42, '#5a5886'); s.addColorStop(0.468, '#a8718a'); s.addColorStop(0.492, '#e99f7c');
  s.addColorStop(0.5, '#f4bd8c'); s.addColorStop(0.508, '#5a5372'); s.addColorStop(1, '#262338');
  g.fillStyle = s; g.fillRect(0, 0, w, h);
}, false);

/* ---------- One merged mesh per kind of surface ----------
   Posts, frames, chairs, leaves... each is a few boxes and blobs. Rather than hundreds of meshes they are
   written into a handful of big ones, coloured per corner. */
const M = new THREE.Matrix4(), NM = new THREE.Matrix3(), Q = new THREE.Quaternion(), E = new THREE.Euler();
const VA = new V3(), VB = new V3(), COL = new THREE.Color();
const BOX = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
const BALL = new THREE.IcosahedronGeometry(1, 1);
const PLANE = new THREE.PlaneGeometry(1, 1).toNonIndexed();
let PARENT = null;   // where the piece being built stands (see at())

function at(x, y, z, ry, build) {
  const m = new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new V3(1, 1, 1));
  const prev = PARENT;
  PARENT = prev ? prev.clone().multiply(m) : m;
  build();
  PARENT = prev;
}

class Batch {
  constructor() { this.p = []; this.n = []; this.c = []; this.u = []; this.a = []; this.gain = 1; }
  add(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, aux = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    M.compose(VA.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), VB.set(sx, sy, sz));
    if (PARENT) M.premultiply(PARENT);
    NM.getNormalMatrix(M);
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    COL.set(color).multiplyScalar(this.gain);
    for (let i = 0; i < P.count; i++) {
      VA.fromBufferAttribute(P, i).applyMatrix4(M); this.p.push(VA.x, VA.y, VA.z);
      VA.fromBufferAttribute(N, i).applyMatrix3(NM).normalize(); this.n.push(VA.x, VA.y, VA.z);
      this.c.push(COL.r, COL.g, COL.b);
      if (U) this.u.push(U.getX(i), U.getY(i)); else this.u.push(0, 0);
      this.a.push(aux);
    }
    if (g !== geo) g.dispose();
    return this;
  }
  box(w, h, d, x, y, z, color, ry = 0, rx = 0, rz = 0) { return this.add(BOX, color, x, y, z, rx, ry, rz, w, h, d); }
  cyl(rTop, rBottom, h, x, y, z, color, seg = 10, rx = 0, rz = 0) {
    const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg);
    this.add(g, color, x, y, z, rx, 0, rz); g.dispose(); return this;
  }
  ball(r, x, y, z, color, sx = 1, sy = 1, sz = 1) { return this.add(BALL, color, x, y, z, 0, 0, 0, r * sx, r * sy, r * sz); }
  mesh(material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setAttribute('aux', new THREE.Float32BufferAttribute(this.a, 1));
    this.p = this.n = this.c = this.u = this.a = null;
    const m = new THREE.Mesh(g, material);
    m.matrixAutoUpdate = false;
    return m;
  }
}

const solid = new Batch();    // painted things, lit by the scene's lights
const lit = new Batch();      // things that glow by themselves: bulbs, light strips, far windows
const glass = new Batch();    // window panes
const decals = new Batch();   // soft pools of lamplight on walls and floors

// Round glows that always face the camera (lamps, lanterns, fairy lights).
const glows = [];
function glow(x, y, z, size, color, gain = 1, flicker = 0.05) {
  VA.set(x, y, z); if (PARENT) VA.applyMatrix4(PARENT);
  COL.set(color).multiplyScalar(gain);
  glows.push(VA.x, VA.y, VA.z, size, rnd() * 6.283, flicker, COL.r, COL.g, COL.b);
}
// kind 0: a round pool, kind 1: a cone of light falling from the top edge.
function decal(kind, w, h, x, y, z, color, gain, rx = 0) {
  decals.gain = gain;
  decals.add(PLANE, color, x, y, z, rx, 0, 0, w, h, 1, kind);
}

/* ---------- Shapes ---------- */
function archShape(cx, bottom, spring, r) {
  const s = new THREE.Shape();
  s.moveTo(cx - r, bottom); s.lineTo(cx - r, spring);
  s.absarc(cx, spring, r, Math.PI, 0, true);
  s.lineTo(cx + r, bottom); s.closePath();
  return s;
}
// An upside-down U: the frame round an arched opening.
function archBand(cx, bottom, spring, r, fw) {
  const s = new THREE.Shape();
  s.moveTo(cx - r, bottom); s.lineTo(cx - r, spring);
  s.absarc(cx, spring, r, Math.PI, 0, true);
  s.lineTo(cx + r, bottom); s.lineTo(cx + r - fw, bottom); s.lineTo(cx + r - fw, spring);
  s.absarc(cx, spring, r - fw, 0, Math.PI, false);
  s.lineTo(cx - r + fw, bottom); s.closePath();
  return s;
}

/* A wall as one extruded slab: inside face, outside face and the thickness shown in the openings each get
   their own paint. `opens` are arch centres along the wall; one of them may be the door. */
function makeWall(len, opens, mats) {
  const s = new THREE.Shape();
  const x0 = -len / 2, x1 = len / 2;
  s.moveTo(x0, GROUND);
  for (const o of opens) if (o.door) {
    s.lineTo(o.x - R, GROUND); s.lineTo(o.x - R, SPRING);
    s.absarc(o.x, SPRING, R, Math.PI, 0, true);
    s.lineTo(o.x + R, GROUND);
  }
  s.lineTo(x1, GROUND); s.lineTo(x1, WALL_H); s.lineTo(x0, WALL_H); s.closePath();
  for (const o of opens) if (!o.door) s.holes.push(archShape(o.x, SILL, SPRING, R));
  const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 18 });
  // ExtrudeGeometry draws both flat faces as one group (back face first, then front); split them.
  const lids = g.groups[0], sides = g.groups[1];
  g.clearGroups();
  g.addGroup(lids.start, lids.count / 2, 0);                      // inside
  g.addGroup(lids.start + lids.count / 2, lids.count / 2, 1);      // outside
  g.addGroup(sides.start, sides.count, 2);                        // thickness
  return new THREE.Mesh(g, mats);
}

/* ---------- Build: outside ---------- */
function buildOutside() {
  // Sky, stars
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(320, 32, 24),
    new THREE.MeshBasicMaterial({ map: texSky, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false })
  );
  sky.renderOrder = -2;
  scene.add(sky);
  const starPos = [];
  for (let i = 0; i < 420; i++) {
    const a = rr(0, 6.283), e = Math.asin(rr(0.16, 1));
    starPos.push(Math.cos(e) * Math.sin(a) * 300, Math.sin(e) * 300, Math.cos(e) * Math.cos(a) * 300);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xFFF4DC, size: 1.7, sizeAttenuation: false, transparent: true, opacity: 0.75, fog: false, depthWrite: false, toneMapped: false }));
  stars.renderOrder = -1;
  scene.add(stars);

  // Pavement
  texPave.repeat.set(220, 220);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(180, 40).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: texPave }));
  ground.position.y = GROUND;
  scene.add(ground);

  // Terrace under the canopy, its step and the light strips under each edge
  texTerrace.repeat.set(17.8 / 0.6, 4.8 / 0.6);
  const terrace = new THREE.Mesh(new THREE.PlaneGeometry(17.8, 4.8).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: texTerrace }));
  terrace.position.set(0, 0.002, 2.1);
  scene.add(terrace);
  solid.box(17.8, 0.145, 4.5, 0, GROUND + 0.0725, 2.25, 0x8A5A45);
  solid.box(3.5, 0.075, 0.5, 0, GROUND + 0.0375, 4.75, 0x9A6A52);
  lit.box(3.5, 0.02, 0.03, 0, -0.03, 4.51, C.warm);
  lit.box(3.5, 0.02, 0.03, 0, GROUND + 0.05, 5.005, C.warm);
  for (let x = -1.5; x <= 1.5; x += 0.75) glow(x, -0.06, 5.0, 0.5, C.warm, 0.22, 0);
  decal(0, 5.4, 2.2, 0, GROUND + 0.01, 5.7, C.warm, 0.4, -Math.PI / 2);

  // Planters with clipped shrubs, taller leaves and little uplights
  for (const side of [-1, 1]) {
    solid.box(7.0, 0.5, 0.55, side * 5.4, GROUND + 0.25, 4.78, 0xD8CCB4);
    solid.box(0.55, 0.5, 4.5, side * 8.62, GROUND + 0.25, 2.25, 0xD8CCB4);
    for (let x = 2.15; x < 8.8; x += rr(0.4, 0.56)) {
      solid.ball(rr(0.26, 0.4), side * x, 0.42 + rr(0, 0.1), 4.78 + rr(-0.08, 0.08), pick(C.leaves), 1, 0.82, 1);
    }
    for (let z = 0.5; z < 4.4; z += rr(0.42, 0.6)) {
      solid.ball(rr(0.26, 0.38), side * 8.62, 0.42 + rr(0, 0.1), z, pick(C.leaves), 1, 0.82, 1);
    }
    for (const x of [2.5, 4.7, 7.0]) {
      leafPlant(side * (x + rr(-0.2, 0.2)), 0.3, 4.72, rr(0.8, 1.15), 7);
      glow(side * (x + 0.9), 0.42, 5.12, 0.9, C.warm, 0.42, 0.03);
      decal(1, 1.5, 1.5, side * (x + 0.9), 0.9, 5.07, C.warm, 0.25);
    }
    leafPlant(side * 8.55, 0.3, 4.6, 1.5, 8);
  }

  // Canopy: green posts, beam, rafters and roof sheet, with fairy lights strung under it
  for (const x of [-8.25, -4.9, -1.75, 1.75, 4.9, 8.25]) solid.box(0.14, 3.5, 0.14, x, 1.75, 4.25, C.canopy);
  solid.box(16.9, 0.2, 0.14, 0, 3.5, 4.25, C.canopy);
  solid.box(17.3, 0.3, 0.06, 0, 3.52, 4.36, 0x356350);
  solid.box(16.9, 0.16, 0.1, 0, 3.8, 0.06, C.canopy);
  for (let x = -8.25; x <= 8.26; x += 0.75) solid.box(0.06, 0.12, 4.3, x, 3.66, 2.15, C.canopy, 0, 0.06);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(17.3, 4.5), new THREE.MeshLambertMaterial({ color: 0x2B5444, side: THREE.DoubleSide }));
  sheet.rotation.x = -Math.PI / 2 + 0.06;
  sheet.position.set(0, 3.75, 2.2);
  scene.add(sheet);
  for (const z of [1.1, 2.3, 3.5]) {
    for (let x = -7.9; x <= 7.9; x += 0.62) {
      const sag = 0.14 * Math.sin(((x + 7.9) / 3.3) * Math.PI) ** 2;
      const y = 3.42 - sag - (z - 1.1) * 0.05;
      lit.ball(0.028, x, y, z, C.bulb);
      glow(x, y, z, 0.26, C.warm, 0.5, 0.35);
    }
  }

  // The glowing sign on the canopy
  const logo = new THREE.TextureLoader().load(new URL('../images/logo-cream.png', import.meta.url).href);
  logo.colorSpace = THREE.SRGBColorSpace; logo.anisotropy = maxAniso;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 3.9 * 274 / 720), new THREE.MeshBasicMaterial({ map: logo, color: 0xFFEFC9, transparent: true, depthWrite: false, toneMapped: false }));
  sign.position.set(0, 4.5, 4.4);
  scene.add(sign);
  solid.box(3.7, 0.04, 0.04, 0, 3.74, 4.36, C.black);
  for (const x of [-1.6, -0.8, 0, 0.8, 1.6]) solid.box(0.03, 0.9, 0.03, x, 4.2, 4.36, C.black);
  for (const x of [-1.3, 0, 1.3]) glow(x, 4.55, 4.5, 2.4, 0xFFC27A, 0.3, 0.02);

  // Roof: the green hip roof and a trim along the top of the walls
  const y0 = WALL_H + 0.02, yr = 6.3;
  const A = [-7.7, y0, -0.3], B = [7.7, y0, -0.3], Cc = [7.7, y0, -DEPTH + 0.3], D = [-7.7, y0, -DEPTH + 0.3];
  const Er = [-3.4, yr, -DEPTH / 2], Fr = [3.4, yr, -DEPTH / 2];
  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...B, ...Fr, ...A, ...Fr, ...Er, ...B, ...Cc, ...Fr, ...Cc, ...D, ...Er, ...Cc, ...Er, ...Fr, ...D, ...A, ...Er], 3));
  roofGeo.computeVertexNormals();
  solid.add(roofGeo, 0x6E9A82);
  solid.box(16.2, 0.14, 0.44, 0, WALL_H + 0.03, -0.15, C.canopy);
  solid.box(16.2, 0.14, 0.44, 0, WALL_H + 0.03, -DEPTH + 0.15, C.canopy);
  solid.box(0.44, 0.14, 15.4, -HALF + 0.15, WALL_H + 0.03, -DEPTH / 2, C.canopy);
  solid.box(0.44, 0.14, 15.4, HALF - 0.15, WALL_H + 0.03, -DEPTH / 2, C.canopy);

  // Carriage lanterns between the arches, each washing the wall below it
  for (const x of [-4.05, -1.35, 1.35, 4.05]) at(x, 0, 0, 0, () => {
    solid.box(0.05, 0.05, 0.2, 0, 2.95, 0.1, C.black);
    solid.box(0.22, 0.04, 0.22, 0, 2.86, 0.2, C.black);
    solid.cyl(0.02, 0.1, 0.08, 0, 2.92, 0.2, C.black, 6);
    lit.box(0.14, 0.26, 0.14, 0, 2.71, 0.2, C.bulb);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) solid.box(0.018, 0.28, 0.018, sx * 0.08, 2.71, 0.2 + sz * 0.08, C.black);
    solid.box(0.2, 0.03, 0.2, 0, 2.56, 0.2, C.black);
    glow(0, 2.71, 0.32, 1.2, C.warm, 0.55, 0.06);
    decal(1, 1.7, 2.9, 0, 1.45, 0.012, C.warm, 0.3);
    decal(0, 1.3, 1.3, 0, 2.75, 0.014, C.warm, 0.3);
  });
  // Light spilling out of the windows onto the terrace
  for (const x of OPENINGS) decal(0, 2.6, 3.6, x, 0.012, 1.5, C.warm, x === 0 ? 0.5 : 0.36, -Math.PI / 2);

  // A palm on the left and a tree on the right, as outside the real place
  palm(-10.3, 3.4, 5.6);
  palm(11.6, -5, 6.6);
  tree(10.2, 6.1);

  // The street: two neighbours close by and a dusk skyline all round
  const tones = [0x596079, 0x4C5470, 0x646A84, 0x525873];
  const windowsOn = (w, h, z, face, chance) => {
    for (let y = 2.3; y < h - 1; y += 3.1) for (let x = -w / 2 + 1.3; x < w / 2 - 0.9; x += 2.1) {
      if (rnd() < chance) { lit.gain = rr(0.25, 0.7); lit.box(0.85, 1.25, 0.06, x, y, z, pick([0xFFC27A, 0xFFD9A0, 0xFFE9C4, 0xBFD4FF])); }
      else solid.box(0.85, 1.25, 0.06, x, y, z, 0x2A3146);
    }
    lit.gain = 1;
    for (let y = 3.9; y < h; y += 3.1) solid.box(w + 0.12, 0.14, 0.2, 0, y, z - face * 0.04, 0x9AA0B4);
  };
  const neighbour = (w, h, d, x, z, tone, chance) => at(x, GROUND, z, 0, () => {
    solid.box(w, h, d, 0, h / 2, 0, tone);
    windowsOn(w, h, d / 2 + 0.02, 1, chance);
  });
  neighbour(13, 11.5, 15, 15.8, -9.5, 0x7F86A0, 0.3);
  neighbour(5, 14.5, 9, 21, -13, 0x6F7690, 0.2);
  neighbour(11, 8.4, 13, -15.8, -8.5, 0x737B95, 0.3);
  neighbour(8, 12, 10, -24.5, -14, 0x646B85, 0.25);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * 6.283 + rr(-0.06, 0.06), d = rr(46, 120);
    const w = rr(9, 22), h = rr(6, 30), dp = rr(8, 16);
    at(Math.sin(a) * d, GROUND, -8 + Math.cos(a) * d, a, () => {
      solid.box(w, h, dp, 0, h / 2, 0, pick(tones));
      for (let y = 2.3; y < h - 1; y += 3.1) for (let x = -w / 2 + 1.3; x < w / 2 - 0.9; x += 2.1) {
        if (rnd() < 0.22) { lit.gain = rr(0.25, 0.7); lit.box(0.9, 1.3, 0.05, x, y, -dp / 2 - 0.04, pick([0xFFC27A, 0xFFD9A0, 0xBFD4FF])); }
      }
      lit.gain = 1;
    });
  }
}

function leafPlant(x, y, z, h, n) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283 + rr(-0.3, 0.3), tilt = rr(0.15, 0.7), len = h * rr(0.6, 1);
    const dx = Math.sin(tilt) * Math.cos(a), dz = Math.sin(tilt) * Math.sin(a), dy = Math.cos(tilt);
    solid.add(BALL, pick(C.leaves), x + dx * len / 2, y + dy * len / 2, z + dz * len / 2, 0, -a, -tilt, 0.03 * len + 0.02, len / 2, 0.1 * len + 0.03);
  }
}
function palm(x, z, h) {
  const lean = rr(-0.06, 0.06);
  for (let i = 0; i < 4; i++) {
    const y = GROUND + (i + 0.5) * (h / 4);
    solid.cyl(0.13 - i * 0.012, 0.16 - i * 0.012, h / 4 + 0.02, x + lean * y, y, z, 0x5B4636, 7);
  }
  const tx = x + lean * h, ty = GROUND + h;
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * 6.283 + rr(-0.2, 0.2), len = rr(1.7, 2.4), droop = rr(0.15, 0.55);
    const c = pick(C.leaves);
    // each frond is two long leaves: one lifting out of the crown, one hanging off its end
    const ux = Math.cos(a), uz = Math.sin(a);
    solid.add(BALL, c, tx + ux * len * 0.25, ty + 0.14 * len, z + uz * len * 0.25, 0, -a, 0.5, len * 0.3, 0.03, 0.2);
    solid.add(BALL, c, tx + ux * len * 0.72, ty + 0.2 * len - droop * 0.5, z + uz * len * 0.72, 0, -a, -droop, len * 0.34, 0.03, 0.17);
  }
}
function tree(x, z) {
  solid.cyl(0.11, 0.17, 3.4, x, GROUND + 1.7, z, 0x5B4636, 7);
  solid.cyl(0.06, 0.1, 1.5, x + 0.3, GROUND + 3.6, z, 0x5B4636, 6, 0, -0.45);
  for (let i = 0; i < 7; i++) {
    solid.ball(rr(0.7, 1.15), x + rr(-0.9, 0.9), GROUND + rr(3.7, 4.9), z + rr(-0.9, 0.9), pick(C.leaves), 1, 0.8, 1);
  }
}

/* ---------- Build: the shell (walls, windows, doors, floor, ceiling) ---------- */
const doorLeaves = [];
function buildShell() {
  const matIn = new THREE.MeshLambertMaterial({ map: texInterior, emissive: 0xffffff, emissiveMap: texInterior, emissiveIntensity: 0.3 });
  const matOut = new THREE.MeshLambertMaterial({ map: texFacade });
  const matReveal = new THREE.MeshLambertMaterial({ color: 0xDCCBA2, emissive: 0xDCCBA2, emissiveIntensity: 0.12 });
  const mats = [matIn, matOut, matReveal];

  const front = makeWall(HALF * 2, OPENINGS.map((x) => ({ x, door: x === 0 })), mats);
  front.position.set(0, 0, -T);
  const back = makeWall(HALF * 2, [], mats);
  back.rotation.y = Math.PI; back.position.set(0, 0, -DEPTH + T);
  const left = makeWall(DEPTH - 2 * T, [], mats);
  left.rotation.y = -Math.PI / 2; left.position.set(-HALF + T, 0, -DEPTH / 2);
  const right = makeWall(DEPTH - 2 * T, [], mats);
  right.rotation.y = Math.PI / 2; right.position.set(HALF - T, 0, -DEPTH / 2);
  scene.add(front, back, left, right);

  // Green frames, glazing bars and glass in every arch
  const fw = 0.085;
  for (const x of OPENINGS) {
    const door = x === 0;
    const bottom = door ? 0 : SILL;
    const band = new THREE.ExtrudeGeometry(archBand(x, bottom, SPRING, R, fw), { depth: 0.14, bevelEnabled: false, curveSegments: 16 });
    solid.add(band, C.frame, 0, 0, -T / 2 - 0.07); band.dispose();
    if (door) continue;
    const z = -T / 2;
    solid.box(2 * R, fw, 0.14, x, SILL + fw / 2, z, C.frame);
    solid.box(2 * R + 0.16, 0.05, 0.4, x, SILL - 0.025, z, 0xCDBB93);                     // sill
    const ri = R - fw;
    for (const dx of [-R / 3, R / 3]) {
      const top = SPRING + Math.sqrt(ri * ri - dx * dx);
      solid.box(0.045, top - SILL - fw, 0.07, x + dx, (top + SILL + fw) / 2, z, C.frame);
    }
    solid.box(2 * ri, 0.045, 0.07, x, SPRING, z, C.frame);
    solid.box(2 * ri, 0.045, 0.07, x, (SILL + SPRING) / 2 + 0.05, z, C.frame);
    const pane = new THREE.ShapeGeometry(archShape(x, SILL + fw, SPRING, ri), 14);
    glass.add(pane, 0xFFD9A0, 0, 0, z); pane.dispose();
  }

  // The double doors: two half-arch leaves hinged at the frame, swinging into the room
  const L = R - fw, stile = 0.08, meet = 0.05, kick = 0.42, ri = L - stile;
  const a1 = Math.acos(-meet / ri);
  const outline = new THREE.Shape();
  outline.moveTo(0, 0.015); outline.lineTo(L, 0.015); outline.lineTo(L, SPRING + L);
  outline.absarc(L, SPRING, L, Math.PI / 2, Math.PI, false); outline.closePath();
  const opening = new THREE.Path();
  opening.moveTo(stile, kick); opening.lineTo(L - meet, kick); opening.lineTo(L - meet, SPRING + ri * Math.sin(a1));
  opening.absarc(L, SPRING, ri, a1, Math.PI, false); opening.closePath();
  outline.holes.push(opening);
  const leafGeo = new THREE.ExtrudeGeometry(outline, { depth: 0.05, bevelEnabled: false, curveSegments: 14 });
  const paneGeo = new THREE.ShapeGeometry(new THREE.Shape(opening.getPoints(14)));
  const leafMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const paneMat = new THREE.MeshBasicMaterial({ color: 0xFFD9A0, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  for (const side of [-1, 1]) {
    const b = new Batch();
    const hold = PARENT; PARENT = null;
    b.add(leafGeo, C.frame, 0, 0, -0.025);
    b.box(L - stile - meet, 0.05, 0.04, (stile + L - meet) / 2, SPRING, 0, C.frame);
    b.box(L - stile - meet, 0.05, 0.04, (stile + L - meet) / 2, (kick + SPRING) / 2 + 0.1, 0, C.frame);
    b.box(0.03, 0.34, 0.11, L - 0.05, 1.12, 0, C.brass);
    PARENT = hold;
    const leaf = new THREE.Group();
    const frame = b.mesh(leafMat); frame.matrixAutoUpdate = true;
    leaf.add(frame, new THREE.Mesh(paneGeo, paneMat));
    leaf.position.set(side * L, 0, -T / 2);
    leaf.scale.x = -side;            // the right-hand leaf is the mirror image
    leaf.userData.dir = -side;       // and swings the other way
    doorLeaves.push(leaf);
    scene.add(leaf);
  }

  // Floor: green quatrefoil tiles round the edge, pale terrazzo in the middle
  const fw2 = IN_X * 2, fd = IN_Z - T;
  texTile.repeat.set(fw2 / 0.5, fd / 0.5);
  const floorMat = new THREE.MeshLambertMaterial({ map: texTile, emissive: 0xffffff, emissiveMap: texTile, emissiveIntensity: 0.16 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(fw2, fd).rotateX(-Math.PI / 2), floorMat);
  floor.position.set(0, 0, -(IN_Z + T) / 2);
  texTerrazzo.repeat.set(5, 5);
  const mid = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 10.6).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: texTerrazzo, emissive: 0xffffff, emissiveMap: texTerrazzo, emissiveIntensity: 0.2 }));
  mid.position.set(0, 0.008, -8);
  scene.add(floor, mid);
  solid.box(10.56, 0.012, 10.76, 0, 0, -8, 0x2B6654);     // a thin green line round the terrazzo
  decal(0, 9, 12, 0, 0.012, -8, 0xFFE0B0, 0.16, -Math.PI / 2);

  // Ceiling, with the skylight cut out of it
  const cs = new THREE.Shape();
  cs.moveTo(-IN_X, -IN_Z); cs.lineTo(IN_X, -IN_Z); cs.lineTo(IN_X, -T); cs.lineTo(-IN_X, -T); cs.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-SKY.x, SKY.z0); hole.lineTo(-SKY.x, SKY.z1); hole.lineTo(SKY.x, SKY.z1); hole.lineTo(SKY.x, SKY.z0); hole.closePath();
  cs.holes.push(hole);
  const ceiling = new THREE.Mesh(new THREE.ShapeGeometry(cs).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xF4EBD6, emissive: 0xF4EBD6, emissiveIntensity: 0.3 }));
  ceiling.position.y = CEIL;
  scene.add(ceiling);
}

/* ---------- Build: the dining room ---------- */
const lanterns = [];
const photoMeshes = [];
const wallPhotos = { left: [], right: [], back: [] };

function chair(x, z, ry, color) {
  at(x, 0, z, ry, () => {
    solid.box(0.44, 0.07, 0.42, 0, 0.47, 0, color);
    solid.box(0.44, 0.32, 0.05, 0, 0.82, -0.215, color, 0, -0.1);
    for (const sx of [-1, 1]) {
      solid.box(0.026, 0.44, 0.026, sx * 0.19, 0.22, 0.18, C.brass);
      solid.box(0.026, 0.96, 0.026, sx * 0.19, 0.48, -0.2, C.brass);
    }
  });
}
function table(x, z, four) {
  const w = four ? 1.25 : 0.8;
  at(x, 0, z, 0, () => {
    solid.box(0.8, 0.045, w, 0, 0.75, 0, C.wood);
    solid.cyl(0.04, 0.04, 0.7, 0, 0.37, 0, 0x26221F, 8);
    solid.cyl(0.2, 0.25, 0.03, 0, 0.015, 0, 0x26221F, 12);
    solid.cyl(0.035, 0.045, 0.14, 0, 0.84, 0, 0x7FA58C, 8);              // little vase
    solid.ball(0.07, 0, 0.96, 0, pick([0xE9B44C, 0xF2E9D2, 0xD9695A]));
    const seats = four ? [[-0.63, -0.3], [-0.63, 0.3], [0.63, -0.3], [0.63, 0.3]] : [[-0.63, 0], [0.63, 0]];
    seats.forEach(([cx, cz], i) => {
      solid.cyl(0.115, 0.09, 0.014, Math.sign(cx) * 0.2, 0.78, cz, 0xF6F2E8, 12);   // plate
      chair(cx, cz, cx < 0 ? Math.PI / 2 : -Math.PI / 2, (i + (four ? 0 : 1)) % 2 ? C.leather : C.seatGreen);
    });
  });
}
// The black gooseneck lamps on the walls; built in a wall's own frame, z pointing into the room.
function barnLamp(y, wash = 0.5) {
  solid.box(0.09, 0.09, 0.02, 0, y + 0.12, 0.01, C.black);
  solid.box(0.022, 0.022, 0.3, 0, y + 0.12, 0.16, C.black);
  solid.box(0.022, 0.1, 0.022, 0, y + 0.08, 0.3, C.black);
  solid.cyl(0.03, 0.15, 0.1, 0, y, 0.3, C.black, 12);
  lit.ball(0.045, 0, y - 0.05, 0.3, C.bulb);
  glow(0, y - 0.07, 0.34, 0.6, C.warm, 0.55, 0.04);
  decal(1, 2.4, 3.2, 0, y - 1.5, 0.012, 0xFFD9A0, wash);
}

function buildRoom() {
  // Skylight: a green-framed well in the ceiling, full of rattan lanterns
  const wellH = SKY.top - CEIL, zc = (SKY.z0 + SKY.z1) / 2, zl = SKY.z1 - SKY.z0;
  solid.box(SKY.x * 2, 0.04, zl, 0, SKY.top, zc, 0x1B3B33);
  solid.box(0.04, wellH, zl, -SKY.x - 0.02, CEIL + wellH / 2, zc, 0x7FA58C);
  solid.box(0.04, wellH, zl, SKY.x + 0.02, CEIL + wellH / 2, zc, 0x7FA58C);
  solid.box(SKY.x * 2, wellH, 0.04, 0, CEIL + wellH / 2, SKY.z0 - 0.02, 0x7FA58C);
  solid.box(SKY.x * 2, wellH, 0.04, 0, CEIL + wellH / 2, SKY.z1 + 0.02, 0x7FA58C);
  const beam = 0x3F7460;
  for (const x of [-SKY.x, SKY.x]) solid.box(0.16, 0.16, zl + 0.16, x, CEIL, zc, beam);
  for (const z of [SKY.z0, SKY.z1]) solid.box(SKY.x * 2 + 0.16, 0.16, 0.16, 0, CEIL, z, beam);
  for (let i = 1; i < 4; i++) solid.box(SKY.x * 2, 0.08, 0.08, 0, CEIL + 0.04, SKY.z0 + (zl * i) / 4, beam);
  solid.box(0.08, 0.08, zl, 0, CEIL + 0.04, zc, beam);

  const profile = [[0.001, 0.27], [0.1, 0.27], [0.165, 0.14], [0.19, 0], [0.165, -0.14], [0.1, -0.27], [0.001, -0.27]].map(([x, y]) => new THREE.Vector2(x, y));
  const lanternGeo = new THREE.LatheGeometry(profile, 14);
  const lanternMat = new THREE.MeshBasicMaterial({ map: texLantern, toneMapped: false });
  for (const gx of [-1.45, 0, 1.45]) for (let j = 0; j < 5; j++) {
    const x = gx + rr(-0.3, 0.3), z = SKY.z0 + 0.9 + j * ((zl - 1.8) / 4) + rr(-0.3, 0.3);
    const s = rr(0.85, 1.35), y = rr(3.45, 4.25);
    const hang = new THREE.Group();          // pivots at the ceiling so the lantern can sway
    hang.position.set(x, SKY.top, z);
    const body = new THREE.Mesh(lanternGeo, lanternMat);
    body.position.y = y - SKY.top; body.scale.setScalar(s);
    hang.add(body);
    hang.userData = { phase: rr(0, 6.283), speed: rr(0.5, 0.9) };
    lanterns.push(hang);
    scene.add(hang);
    solid.box(0.012, SKY.top - y - 0.27 * s, 0.012, x, (SKY.top + y + 0.27 * s) / 2, z, C.black);
    glow(x, y, z, 1.25 * s, 0xFFA95E, 0.5, 0.05);
  }
  // Greenery trailing over the edge of the skylight
  const ivy = [0x1F4D2C, 0x2A5C36, 0x25552F, 0x346B3C];
  const vine = (x, z) => {
    solid.ball(rr(0.1, 0.16), x + rr(-0.05, 0.05), CEIL - rr(0.03, 0.09), z + rr(-0.05, 0.05), pick(ivy), 1.2, 0.55, 1.2);
    if (rnd() < 0.2) for (let k = 1, n = Math.floor(rr(2, 5)); k <= n; k++) solid.ball(rr(0.045, 0.075), x + rr(-0.03, 0.03), CEIL - 0.08 - k * 0.13, z + rr(-0.03, 0.03), pick(ivy), 1, 1.3, 1);
  };
  for (let z = SKY.z0; z <= SKY.z1; z += 0.22) { vine(-SKY.x - 0.14, z); vine(SKY.x + 0.14, z); }
  for (let x = -SKY.x; x <= SKY.x; x += 0.22) { vine(x, SKY.z0 - 0.14); vine(x, SKY.z1 + 0.14); }

  // Four columns at the corners of the skylight, each with a cluster of lamps
  for (const x of [-SKY.x, SKY.x]) for (const z of [SKY.z0, SKY.z1]) at(x, 0, z, 0, () => {
    solid.box(0.3, 1.15, 0.3, 0, 0.575, 0, C.darkwood);
    solid.box(0.34, 0.06, 0.34, 0, 1.18, 0, 0x3F2A1D);
    solid.box(0.22, CEIL - 1.2, 0.22, 0, (CEIL + 1.2) / 2, 0, C.sage);
    solid.box(0.36, 0.1, 0.36, 0, CEIL - 0.13, 0, C.darkwood);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      solid.box(dx ? 0.26 : 0.02, 0.02, dz ? 0.26 : 0.02, dx * 0.2, 2.95, dz * 0.2, C.black);
      solid.cyl(0.03, 0.09, 0.09, dx * 0.32, 2.9, dz * 0.32, C.black, 8);
      lit.ball(0.04, dx * 0.32, 2.84, dz * 0.32, C.bulb);
    }
    glow(0, 2.86, 0, 1.3, C.warm, 0.42, 0.04);
  });

  // Tables and chairs, with an aisle up the middle and room to walk along the walls
  for (const z of [-2.9, -5.4, -7.5, -9.4]) for (const x of [-3.0, -1.3, 1.3, 3.0]) table(x, z, Math.abs(x) > 2);

  // Small downlights round the edge of the ceiling
  const spot = (x, z) => {
    solid.cyl(0.085, 0.085, 0.02, x, CEIL - 0.008, z, 0xD9CFB8, 12);
    lit.cyl(0.06, 0.06, 0.02, x, CEIL - 0.014, z, C.bulb, 12);
    glow(x, CEIL - 0.06, z, 0.5, C.warm, 0.4, 0.02);
  };
  for (let z = -1.8; z > -15; z -= 2.6) { spot(-5.6, z); spot(5.6, z); }
  for (const x of [-2.8, 0, 2.8]) { spot(x, -1.8); spot(x, -12.6); spot(x, -14.6); }

  // Big pots in the corners
  for (const [x, z] of [[-7.05, -0.95], [7.05, -0.95], [-7.05, -15.05], [7.05, -15.05]]) {
    solid.cyl(0.3, 0.22, 0.55, x, 0.275, z, 0xA65E3F, 12);
    leafPlant(x, 0.5, z, 1.7, 10);
  }
  // Lamps on the inside of the front wall, between the arches
  for (const x of [-4.05, -1.35, 1.35, 4.05]) at(x, 0, -T, Math.PI, () => barnLamp(2.95, 0.2));

  buildPhotos();
}

/* The photos. Read from the page so the 3D room always shows the same ones. */
const loader = new THREE.TextureLoader();
function photoTexture(src, onLoad) {
  const t = loader.load(new URL(src, document.baseURI).href, onLoad);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  return t;
}
function buildPhotos() {
  const dishes = [...document.querySelectorAll('.dish')].slice(0, 10).map((li, i, all) => {
    const img = li.querySelector('img');
    const ratio = (Number(img.getAttribute('width')) || 4) / (Number(img.getAttribute('height')) || 3);
    return { li, link: li.querySelector('a.zoom'), src: img.getAttribute('src'), ratio, index: i, total: all.length };
  });
  const half = Math.ceil(dishes.length / 2);
  const place = (list, side) => list.forEach((d, i) => {
    // spread along the wall; the left wall is walked front to back, the right wall back to front
    const f = list.length > 1 ? i / (list.length - 1) : 0.5;
    const z = side < 0 ? lerp(-3.4, -12.1, f) : lerp(-12.1, -3.4, f);
    const long = 1.5, w = d.ratio >= 1 ? long : long * d.ratio, h = d.ratio >= 1 ? long / d.ratio : long;
    const y = 1.72;
    at(side * IN_X, 0, z, -side * Math.PI / 2, () => {
      solid.box(w + 0.2, h + 0.2, 0.05, 0, y, 0.025, 0x2F6B58);
      lit.gain = 0.82; lit.box(w + 0.1, h + 0.1, 0.012, 0, y, 0.052, C.paper); lit.gain = 1;
      barnLamp(y + h / 2 + 0.38, 0.3);
    });
    const mat = new THREE.MeshBasicMaterial({ color: 0xE3D3A6, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(side * (IN_X - 0.062), y, z);
    mesh.rotation.y = -side * Math.PI / 2;
    mesh.userData = { link: d.link, src: d.src };
    scene.add(mesh); photoMeshes.push(mesh);
    (side < 0 ? wallPhotos.left : wallPhotos.right).push({ x: side * IN_X, y, z, w, h, dish: d });
  });
  place(dishes.slice(0, half), -1);
  place(dishes.slice(half), 1);

  // Back wall: the "made by hand" photos, framed like the sage arched windows
  const made = [...document.querySelectorAll('.made__list > li')].slice(0, 3);
  const r = 0.86, bottom = 0.85, spring = 2.3, bw = 0.1;
  made.forEach((li, i) => {
    const x = (i - (made.length - 1) / 2) * 3.1;
    at(x, 0, -IN_Z, 0, () => {
      const band = new THREE.ExtrudeGeometry(archBand(0, bottom - bw, spring, r + bw, bw), { depth: 0.07, bevelEnabled: false, curveSegments: 18 });
      solid.add(band, C.sage); band.dispose();
      solid.box(2 * r + 2 * bw, bw, 0.07, 0, bottom - bw / 2, 0.035, C.sage);
      barnLamp(spring + r + 0.42, 0.3);
    });
    const geo = new THREE.ShapeGeometry(archShape(0, bottom, spring, r), 20);
    const pos = geo.attributes.position, uv = geo.attributes.uv, w = 2 * r, h = spring + r - bottom;
    for (let k = 0; k < pos.count; k++) uv.setXY(k, (pos.getX(k) + r) / w, (pos.getY(k) - bottom) / h);
    const mat = new THREE.MeshBasicMaterial({ color: 0xE3D3A6, toneMapped: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, -IN_Z + 0.03);
    const img = li.querySelector('img');
    mesh.userData = { link: li.querySelector('a.zoom'), src: img.getAttribute('src'), cover: w / h };
    scene.add(mesh); photoMeshes.push(mesh);
    wallPhotos.back.push({ x, y: bottom + h / 2, z: -IN_Z, w, h, li });
  });
}
// Fetch the pictures once the model is on screen, nearest wall first.
function loadPhotos() {
  photoMeshes.forEach((mesh, i) => setTimeout(() => {
    const t = photoTexture(mesh.userData.src, () => {
      const cover = mesh.userData.cover;
      if (cover) {                       // fill the arch without stretching the picture
        const ia = t.image.width / t.image.height;
        if (ia > cover) { t.repeat.set(cover / ia, 1); t.offset.set((1 - cover / ia) / 2, 0); }
        else { t.repeat.set(1, ia / cover); t.offset.set(0, (1 - ia / cover) * 0.6); }
      }
      mesh.material.map = t; mesh.material.color.set(0xffffff); mesh.material.needsUpdate = true;
    });
  }, i * 60));
}

/* ---------- Put it together ---------- */
buildOutside();
buildShell();
buildRoom();

scene.add(solid.mesh(new THREE.MeshLambertMaterial({ vertexColors: true })));
scene.add(lit.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })));
const glassMesh = glass.mesh(new THREE.MeshBasicMaterial({ color: 0xFFD9A0, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
scene.add(glassMesh);

const decalMesh = decals.mesh(new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: `
    attribute vec3 color; attribute float aux;
    varying vec3 vColor; varying vec2 vUv; varying float vKind;
    void main() { vUv = uv; vColor = color; vKind = aux; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    varying vec3 vColor; varying vec2 vUv; varying float vKind;
    void main() {
      float a;
      if (vKind < 0.5) { float d = length(vUv - 0.5) * 2.0; a = pow(max(0.0, 1.0 - d), 1.8); }
      else {
        float y = vUv.y, x = (vUv.x - 0.5) / (0.09 + 0.4 * (1.0 - y));
        a = exp(-x * x * 3.0) * pow(y, 1.5) * smoothstep(1.0, 0.93, y);
      }
      gl_FragColor = vec4(vColor * a, 1.0);
      #include <colorspace_fragment>
    }`,
}));
decalMesh.renderOrder = 2;
scene.add(decalMesh);

const glowGeo = new THREE.InstancedBufferGeometry();
glowGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0], 3));
glowGeo.setIndex([0, 1, 2, 2, 1, 3]);
const glowData = new THREE.InstancedInterleavedBuffer(new Float32Array(glows), 9);
glowGeo.setAttribute('aCenter', new THREE.InterleavedBufferAttribute(glowData, 3, 0));
glowGeo.setAttribute('aParams', new THREE.InterleavedBufferAttribute(glowData, 3, 3));
glowGeo.setAttribute('aColor', new THREE.InterleavedBufferAttribute(glowData, 3, 6));
glowGeo.instanceCount = glows.length / 9;
const glowMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    attribute vec3 aCenter; attribute vec3 aParams; attribute vec3 aColor;
    uniform float uTime;
    varying vec2 vUv; varying vec3 vColor;
    void main() {
      vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
      float tw = 1.0 + aParams.z * sin(uTime * (1.1 + aParams.y * 0.35) + aParams.y * 9.0);
      mv.xy += position.xy * aParams.x * tw;
      mv.z += aParams.x * 0.3;            // sit a little nearer than the lamp, so walls don't slice the glow
      gl_Position = projectionMatrix * mv;
      vUv = position.xy * 2.0; vColor = aColor * tw;
    }`,
  fragmentShader: `
    varying vec2 vUv; varying vec3 vColor;
    void main() {
      float a = max(0.0, 1.0 - length(vUv));
      a = a * a * (0.55 + 0.45 * a * a * a);
      gl_FragColor = vec4(vColor * a, 1.0);
      #include <colorspace_fragment>
    }`,
});
const glowMesh = new THREE.Mesh(glowGeo, glowMat);
glowMesh.frustumCulled = false;
glowMesh.renderOrder = 3;
scene.add(glowMesh);

/* ---------- Light ---------- */
const hemi = new THREE.HemisphereLight(0x93A6D6, 0x4A3A36, 1.25);
const moon = new THREE.DirectionalLight(0xB9C6FF, 1.1);
moon.position.set(-7, 12, 14);
const fill = new THREE.AmbientLight(0xFFDDB0, 0);          // comes up as you walk in
const porch = new THREE.PointLight(0xFFB870, 16, 14, 1.8);
porch.position.set(0, 3.0, 2.2);
scene.add(hemi, moon, fill, porch);
for (const z of [-3, -8, -13]) {
  const l = new THREE.PointLight(0xFFC88A, 26, 18, 1.7);
  l.position.set(0, 3.35, z);
  scene.add(l);
}

/* ---------- The walk: a camera path through key points ---------- */
const copy = hero.querySelector('.hero__copy');
const capEl = stage.querySelector('.tour__cap');
const capKicker = stage.querySelector('.tour__kicker');
const capTitle = stage.querySelector('.tour__title');
const capText = stage.querySelector('.tour__text');
const hintEl = stage.querySelector('.tour__hint');
const skipEl = stage.querySelector('.tour__skip');
const barEl = stage.querySelector('.tour__bar i');
const domeEl = document.querySelector('.cap__dome');

const words = (el) => (el ? (el.getAttribute('aria-label') || el.textContent).replace(/\s+/g, ' ').trim() : '');
const say = (sel) => words(document.querySelector(sel));
// Each caption is read from the page when it is shown, so it follows the VI | EN switch.
const CAPTION = {
  in: () => ['Benvenuti', say('[data-tour="in.title"]'), say('[data-tour="in.text"]')],
  room: () => [say('.room .kicker'), say('[data-tour="room.title"]'), say('[data-tour="room.text"]')],
  made: (li) => () => [say('.made .kicker'), words(li.querySelector('h3')), words(li.querySelector('p'))],
  dish: (d) => () => [`${say('#food .kicker')} · ${d.index + 1}/${d.total}`, words(d.li.querySelector('h3')), words(d.li.querySelector('p'))],
};

let K = [];                 // key points
let posCurve, lookCurve, cum = [0], baseFov = 50;
const UNIT = 44;            // how much scrolling one step of the walk takes, in % of the screen height

const fovFor = (a) => (a >= 1.35 ? 48 : a <= 0.6 ? 68 : 68 - 20 * ((a - 0.6) / 0.75));

function buildKeys() {
  const a = camera.aspect, th = Math.tan(THREE.MathUtils.degToRad(baseFov) / 2), tw = th * a;
  const fit = (w, h) => Math.max(w / (2 * tw), h / (2 * th));    // how far back to stand to see w x h
  const tall = a < 1;
  K = [];
  const key = (pos, look, w, extra = {}) => K.push({ pos: new V3(...pos), look: new V3(...look), w, cap: null, fov: 0, ox: 0, oy: 0, ...extra });

  // 0  across the street, three-quarter view. On a wide screen the building stands to the right of the
  //    headline; on a phone it is fitted into the space between the header and the words below it.
  {
    let d = fit(tall ? 12.5 : 31, tall ? 15 : 13), shift = { ox: -0.17 };
    if (window.matchMedia('(max-width: 860px)').matches && copy) {
      const H = stage.clientHeight, top = 76, bottom = Math.max(top + 90, copy.offsetParent ? copy.offsetParent.offsetTop + copy.offsetTop - 14 : H * 0.5);
      shift = { oy: clamp(0.5 - (top + bottom) / 2 / H, 0, 0.32) };
      if (tall) d = Math.max(fit(12.5, 0), 7.4 / (2 * th * clamp((bottom - top) / H, 0.2, 1)));
    }
    const target = [0.2, 2.6, 1.8], dir = new V3(-0.4, 0.03, 1).normalize();
    key([target[0] + dir.x * d, target[1] + dir.y * d, target[2] + dir.z * d], target, 0, shift);
  }
  // 1  straight on, in front of the canopy
  key([0, 1.8, 4.6 + fit(tall ? 6.2 : 11.5, tall ? 8.5 : 6.4)], [0, 2.55, 0], 1.2);
  // 2  under the canopy as the doors swing open
  key([0, 1.66, 3.5], [0, 1.95, -6], 0.9, { cap: CAPTION.in, fov: 3 });
  // 3  in the doorway
  key([0, 1.6, 0.25], [0, 2.2, -8], 0.75, { fov: 9 });
  // 4  inside, looking up the room to the lanterns
  key([0, 1.66, -2.2], [0, tall ? 2.25 : 2.75, -8.2], 0.8, { cap: CAPTION.room, fov: 2 });
  // Inside, each photo sits to the right of its caption on a wide screen and above it on a phone.
  const frame = tall ? { oy: 0.1 } : { ox: -0.12 };
  // the left wall, front to back: stand back far enough to see the frame, the lamp over it and the floor
  const beside = (ph, lead) => {
    const d = clamp(fit(ph.w / 0.6, ph.h / 0.44), 3.0, 3.9), side = Math.sign(ph.x);
    key([ph.x - side * d, 1.6, ph.z + lead], [ph.x, ph.y - (tall ? 0.3 : 0.2), ph.z], 0.78, { cap: CAPTION.dish(ph.dish), ...frame });
  };
  wallPhotos.left.forEach((ph) => beside(ph, 0.7));
  // along the back wall, one arch at a time
  wallPhotos.back.forEach((ph, i) => {
    const d = clamp(fit(ph.w / 0.6, ph.h / 0.6), 3, 3.9);
    key([ph.x * 0.82, 1.64, -IN_Z + d], [ph.x, ph.y + (tall ? -0.1 : 0.05), -IN_Z], i ? 0.7 : 0.95, { cap: CAPTION.made(ph.li), ...(tall ? frame : { ox: -0.17 }) });
  });
  // the right wall, back to front
  wallPhotos.right.forEach((ph, i) => { beside(ph, -0.7); if (!i) K[K.length - 1].w = 0.95; });
  // last look up into the lanterns, then rise into them as the page slides over
  key([0, 1.62, -2.4], [0, 3.4, -7.4], 0.9, { fov: 2 });
  key([0, 2.5, -5.4], [0, 4.5, -7.7], 0, { fov: 8 });

  posCurve = new THREE.CatmullRomCurve3(K.map((k) => k.pos), false, 'centripetal');
  lookCurve = new THREE.CatmullRomCurve3(K.map((k) => k.look), false, 'centripetal');
  cum = [0];
  for (let i = 1; i < K.length - 1; i++) cum.push(cum[i - 1] + K[i].w);
}
// Scroll progress (0..1) to a place on the path, counted in key points.
function keyAt(p) {
  const x = p * cum[cum.length - 1];
  let i = 0;
  while (i < cum.length - 2 && x > cum[i + 1]) i++;
  return i + clamp((x - cum[i]) / (cum[i + 1] - cum[i]));
}

/* ---------- Scroll state ---------- */
const vhUnit = window.CSS && CSS.supports && CSS.supports('height', '100lvh') ? 'lvh' : 'vh';
let touring = false, visible = true;
let pT = 0, qT = 0, pS = 0, qS = 0;     // target and smoothed: p = the walk, q = the page sliding over at the end
let shown = -1, lastHero = -1;

function setTrack() {
  if (touring) hero.style.setProperty('--tour-h', `${Math.round(cum[cum.length - 1] * UNIT) + 200}${vhUnit}`);
}
function readScroll() {
  const r = hero.getBoundingClientRect(), vh = stage.offsetHeight || window.innerHeight;
  if (touring) {
    const walk = Math.max(1, r.height - 2 * vh);
    pT = clamp(-r.top / walk);
    qT = clamp((-r.top - walk) / vh);
    visible = r.bottom > 0 && qT < 1;
    if (domeEl) domeEl.style.setProperty('--cap', `${(Math.min(vh * 0.26, window.innerWidth * 0.36) * (1 - smooth(0.3, 1, qT))).toFixed(1)}px`);
  } else {
    pT = 0; qT = 0;
    visible = r.bottom > 0;
  }
}
function startTour() {
  if (touring) return;
  touring = true;
  root.classList.add('tour');
  setTrack();
  window.dispatchEvent(new Event('bonta:tour'));
}

/* ---------- Resize ---------- */
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  baseFov = fovFor(camera.aspect);
  buildKeys();
  setTrack();
  kick();
}

/* ---------- Pointer: a little parallax, and tap a photo to open it ---------- */
const mouse = { x: 0, y: 0, sx: 0, sy: 0, moved: false, nx: 0, ny: 0 };
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let inside = 0;
const photoUnder = (cx, cy) => {
  const r = canvas.getBoundingClientRect();
  ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(photoMeshes, false)[0];
  return hit && hit.distance < 9 ? hit.object : null;
};
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.nx = e.clientX; mouse.ny = e.clientY; mouse.moved = true;
    kick();
  }, { passive: true });
}
canvas.addEventListener('click', (e) => {
  if (inside < 0.5) return;
  const mesh = photoUnder(e.clientX, e.clientY);
  if (mesh && mesh.userData.link) mesh.userData.link.click();    // opens the page's own photo viewer
});

/* ---------- Every frame ---------- */
const P = new V3(), L = new V3();
function setCaption(i) {
  shown = i;
  const cap = i >= 0 && K[i] && K[i].cap;
  if (!cap) return;
  const [kicker, title, text] = cap();
  capKicker.textContent = kicker; capTitle.textContent = title; capText.textContent = text;
}
function update(time, dt) {
  const n = K.length - 1;
  const k = clamp(keyAt(pS) + qS, 0, n);
  const i = Math.min(n - 1, Math.floor(k)), u = k - i;
  const e = lerp(u, u * u * (3 - 2 * u), 0.6);          // ease in and out of each key point, so each photo gets a pause
  posCurve.getPoint((i + e) / n, P); lookCurve.getPoint((i + e) / n, L);
  const A = K[i], B = K[i + 1];

  // camera: path + a slow breathing sway + the mouse
  mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3); mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
  camera.position.copy(P); camera.lookAt(L);
  camera.translateX(mouse.sx * 0.22 + Math.sin(time * 0.43) * 0.03);
  camera.translateY(-mouse.sy * 0.1 + Math.sin(time * 0.6) * 0.018);
  camera.lookAt(L);
  camera.fov = baseFov + lerp(A.fov, B.fov, e);
  const ox = lerp(A.ox, B.ox, e), oy = lerp(A.oy, B.oy, e);
  const w = stage.clientWidth, h = stage.clientHeight;
  if (Math.abs(ox) + Math.abs(oy) > 0.0005) camera.setViewOffset(w, h, ox * w, oy * h, w, h);
  else if (camera.view) camera.clearViewOffset();
  camera.updateProjectionMatrix();

  // doors, and the change of light from the street to the room
  const open = smooth(1.05, 1.95, k) * 1.78;
  for (const leaf of doorLeaves) leaf.rotation.y = leaf.userData.dir * -open;
  inside = smooth(2.5, 3.5, k);
  scene.fog.density = lerp(0.011, 0.004, inside);
  renderer.toneMappingExposure = lerp(1.2, 1.02, inside);
  fill.intensity = lerp(0, 0.5, inside);
  hemi.intensity = lerp(1.25, 0.6, inside);
  glassMesh.material.opacity = lerp(0.16, 0.07, inside);

  for (const hang of lanterns) {
    hang.rotation.z = Math.sin(time * hang.userData.speed + hang.userData.phase) * 0.035;
    hang.rotation.x = Math.cos(time * hang.userData.speed * 0.8 + hang.userData.phase) * 0.025;
  }
  glowMat.uniforms.uTime.value = time;

  // the words on top
  const heroIn = 1 - smooth(0.03, 0.4, k);
  if (Math.abs(heroIn - lastHero) > 0.002) {
    lastHero = heroIn;
    stage.style.setProperty('--hero-in', heroIn.toFixed(3));
    if (copy) copy.style.visibility = heroIn < 0.02 ? 'hidden' : '';
  }
  stage.style.setProperty('--flash', (smooth(2.5, 3.0, k) * (1 - smooth(3.0, 3.8, k)) * 0.4).toFixed(3));
  if (hintEl) hintEl.style.opacity = touring ? (1 - smooth(0.02, 0.25, k)).toFixed(3) : '0';
  if (skipEl) {
    const o = touring ? smooth(0.25, 0.6, k) * (1 - smooth(0, 0.3, qS)) : 0;
    skipEl.style.opacity = o.toFixed(3);
    skipEl.style.visibility = o < 0.02 ? 'hidden' : '';
  }
  if (barEl) barEl.style.transform = `scaleX(${touring ? pS.toFixed(4) : 0})`;

  // caption: the nearest key point that has one; the words are swapped while they are faded out
  let best = -1, dist = 9;
  for (let j = 0; j <= n; j++) if (K[j].cap && Math.abs(k - j) < dist) { dist = Math.abs(k - j); best = j; }
  const shows = (j) => (j >= 0 && K[j] && K[j].cap ? 1 - smooth(0.2, 0.46, Math.abs(k - j)) : 0);
  if (best !== shown && shows(shown) < 0.03) setCaption(best);
  const o = shows(shown) * (1 - smooth(0, 0.3, qS));
  capEl.style.opacity = o.toFixed(3);
  capEl.style.transform = `translate3d(0, ${((1 - o) * 16).toFixed(1)}px, 0)`;

  if (mouse.moved) {
    mouse.moved = false;
    canvas.style.cursor = inside > 0.5 && photoUnder(mouse.nx, mouse.ny) ? 'zoom-in' : '';
  }
}

let raf = 0, last = 0, slow = 0, frames = 0, tick = 0, movedAt = 0;
function frame(now) {
  raf = 0;
  readScroll();
  if (!visible) return;                      // off screen: stop until the next scroll
  // Standing still, only the lights twinkle: draw every other frame and spare the battery.
  const moving = Math.abs(pT - pS) > 0.00005 || Math.abs(qT - qS) > 0.0005 || mouse.moved;
  if (moving) movedAt = now;
  const idle = now - movedAt > 700;
  if (idle && (tick++ & 1)) { raf = requestAnimationFrame(frame); return; }
  const raw = (now - last) / 1000, dt = Math.min(0.05, Math.max(0.001, raw));
  last = now;
  const ease = 1 - Math.exp(-dt * 7);
  pS += (pT - pS) * ease; qS += (qT - qS) * ease;
  if (Math.abs(pT - pS) < 0.00005) pS = pT;
  if (Math.abs(qT - qS) < 0.0005) qS = qT;
  update(now / 1000, dt);
  renderer.render(scene, camera);

  // If the phone can't keep up while the camera is moving, draw fewer pixels rather than stutter.
  // "Can't keep up" means under about 24 pictures a second: an iPhone in Low Power Mode runs at a steady 30
  // and must not be mistaken for a slow one.
  if (!FORCED && !idle && raw < 0.25) {
    frames++; slow += raw > 0.042 ? 1 : 0;
    if (frames >= 45) {
      if (slow > 22 && dpr > 0.8) { dpr = Math.max(0.75, dpr - 0.25); renderer.setPixelRatio(dpr); renderer.setSize(stage.clientWidth, stage.clientHeight, false); }
      frames = 0; slow = 0;
    }
  }
  raf = requestAnimationFrame(frame);
}
function kick() {
  if (raf || document.hidden) return;
  last = performance.now() - 16;
  raf = requestAnimationFrame(frame);
}

/* ---------- Go ---------- */
camera.aspect = Math.max(0.2, stage.clientWidth / Math.max(1, stage.clientHeight));
baseFov = fovFor(camera.aspect);
buildKeys();
resize();
readScroll();
update(performance.now() / 1000, 0.016);
renderer.render(scene, camera);          // first picture (this is where the shaders are compiled)
root.classList.add('tour-ready');
loadPhotos();
if (FORCED) window.bontaTour = { renderer, scene, camera };   // for poking at the model from the console (?3d=1)

if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
else window.addEventListener('resize', resize);
window.addEventListener('scroll', kick, { passive: true });
document.addEventListener('visibilitychange', kick);
window.addEventListener('pageshow', kick);           // coming back with the back button
document.addEventListener('bonta:lang', () => { setCaption(shown); resize(); });   // the headline may be taller or shorter now
if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); if (raf) cancelAnimationFrame(raf); raf = 0; });
canvas.addEventListener('webglcontextrestored', kick);

// Start the walk if the visitor is still at the top; if they have already scrolled on (slow connection),
// leave the page alone and start it when they come back up.
if (window.scrollY < window.innerHeight * 0.3) startTour();
else {
  const later = () => { if (window.scrollY < 4) { window.removeEventListener('scroll', later); startTour(); } };
  window.addEventListener('scroll', later, { passive: true });
}
kick();
