/* ════════════════════════════════════════
   URBAN SMART CITY CLIMATE PREDICTOR
   js/scene3d.js  —  Three.js 3D city view
════════════════════════════════════════ */

let renderer, scene, camera, animId, clock;
let isDrag = false, isRight = false, prev = { x: 0, y: 0 };
let theta = 0.75, phi = 1.05, radius = 95;
let target = new THREE.Vector3(0, 0, 0);
let particles, particleVelocities = [], waterMeshes = [], animBuildings = [];
let frameN = 0;

/* ──────────────────────────────────────
   LAUNCH 3D view for a city
────────────────────────────────────── */
function launch3D(city) {
  // Show weather panel
  showWeatherPanel(city);

  // Switch UI
  document.getElementById('mapWrap').style.display   = 'none';
  document.getElementById('scene3d').style.display   = 'block';
  document.getElementById('backBtn').style.display   = 'block';
  document.getElementById('inst').style.display      = 'none';
  document.getElementById('ctrl3d').style.display    = 'block';
  document.getElementById('zoneHud').style.display   = 'flex';

  // Teardown old scene
  if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
  if (animId)   cancelAnimationFrame(animId);
  waterMeshes = []; animBuildings = []; particleVelocities = [];

  buildScene(city);
}

/* ──────────────────────────────────────
   WEATHER PANEL
────────────────────────────────────── */
function showWeatherPanel(city) {
  document.getElementById('wpCity').textContent = city.name;
  document.getElementById('wpTemp').textContent = city.temp + '°C';
  document.getElementById('wpHum').textContent  = city.hum  + '%';
  document.getElementById('wpCond').textContent = city.cond;
  document.getElementById('wpWind').textContent = city.wind;
  document.getElementById('wpUv').textContent   = city.uv;

  const badge = document.getElementById('wpBadge');
  const styles = {
    hot:      { bg:'rgba(255,50,50,.18)',  border:'#ff4444', color:'#ff6666', label:'🔴 HOT ZONE' },
    moderate: { bg:'rgba(255,170,0,.18)',  border:'#ffaa00', color:'#ffcc44', label:'🟠 MODERATE' },
    cool:     { bg:'rgba(0,200,255,.18)',  border:'#00cfff', color:'#00dfff', label:'🔵 COOL ZONE' },
  };
  const s = styles[city.level] || styles.cool;
  badge.style.background  = s.bg;
  badge.style.border      = `1px solid ${s.border}`;
  badge.style.color       = s.color;
  badge.textContent       = s.label;

  const advList = ADV[city.level] || ADV.cool;
  document.getElementById('wpAdv').innerHTML = advList
    .map(a => `<div class="adv">${a}</div>`).join('');

  document.getElementById('wp').style.display = 'block';
}

/* ──────────────────────────────────────
   BUILD THREE.JS SCENE
────────────────────────────────────── */
function buildScene(city) {
  const canvas = document.getElementById('c3d');
  const W = canvas.offsetWidth, H = canvas.offsetHeight;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
  clock  = new THREE.Clock();

  // Sky color by level
  const skyColors = { hot:'#1a0505', moderate:'#050d1a', cool:'#030610' };
  scene.background = new THREE.Color(skyColors[city.level] || '#050d1a');
  scene.fog        = new THREE.FogExp2(scene.background, 0.008);

  positionCamera();

  // Lights
  const amb = new THREE.AmbientLight(0x112233, 0.6);
  scene.add(amb);

  const sun = new THREE.DirectionalLight(
    city.level === 'hot' ? 0xff6633 : city.level === 'cool' ? 0x8888ff : 0xffeedd,
    city.level === 'hot' ? 2.5 : 1.8
  );
  sun.position.set(40, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 300;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -80;
  sun.shadow.camera.right = sun.shadow.camera.top = 80;
  scene.add(sun);

  const fill = new THREE.PointLight(
    city.level === 'hot' ? 0xff2200 : city.level === 'cool' ? 0x0033ff : 0x0044aa, 1.5, 120
  );
  fill.position.set(-30, 20, -20);
  scene.add(fill);

  // Ground
  const gGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
  const gMat = new THREE.MeshStandardMaterial({
    color: city.level === 'hot' ? 0x3a1a00 : city.level === 'cool' ? 0x0a1520 : 0x0a1a0a,
    roughness: 0.9, metalness: 0.1,
  });
  const ground = new THREE.Mesh(gGeo, gMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Roads
  addRoads();

  // Buildings grid
  const gridSize = 9, spacing = 14;
  const offset   = ((gridSize - 1) * spacing) / 2;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (Math.random() < .22) continue;
      const x = r * spacing - offset + (Math.random() - .5) * 3;
      const z = c * spacing - offset + (Math.random() - .5) * 3;
      addBuilding(x, z, city);
    }
  }

  // Trees
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 30 + Math.random() * 50;
    addTree(Math.cos(angle) * dist, Math.sin(angle) * dist, city);
  }

  // Water (cool cities)
  if (city.level === 'cool') addWater();

  // Particles
  addParticles(city);

  // Atmospheric haze (hot)
  if (city.level === 'hot') addHeatHaze();

  // Stars (cool/moderate)
  if (city.level !== 'hot') addStars();

  // Orbit controls (manual)
  setupOrbitControls();

  // Animate
  animate(city);
}

/* ──────────────────────────────────────
   SCENE HELPERS
────────────────────────────────────── */
function addRoads() {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .95 });
  [
    [0, 0, 200, 4],
    [0, 0, 4, 200],
    [30, 0, 200, 2],
    [-30, 0, 200, 2],
    [0, 30, 2, 200],
    [0, -30, 2, 200],
  ].forEach(([x, z, w, d]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, .05, d), roadMat);
    m.position.set(x, .01, z);
    m.receiveShadow = true;
    scene.add(m);
  });
}

function addBuilding(x, z, city) {
  const h   = 3 + Math.random() * 28;
  const w   = 3 + Math.random() * 5;
  const d   = 3 + Math.random() * 5;
  const geo = new THREE.BoxGeometry(w, h, d);

  const t = city.level === 'hot'     ? Math.random() * .5
          : city.level === 'moderate'? .3 + Math.random() * .4
          :                            .5 + Math.random() * .5;

  const hotCols  = [0x4a1a00, 0x3a0d00, 0x5a2200, 0x6a3010, 0x2a0800];
  const modCols  = [0x1a2a3a, 0x0d2040, 0x152535, 0x203050, 0x0a1530];
  const coolCols = [0x0a1525, 0x0d2035, 0x152040, 0x0a1020, 0x1a2535];

  const palettes = { hot: hotCols, moderate: modCols, cool: coolCols };
  const arr = palettes[city.level];
  const col = arr[Math.floor(Math.random() * arr.length)];

  const mat = new THREE.MeshStandardMaterial({
    color: col, roughness: .6, metalness: .4,
    emissive: col, emissiveIntensity: .08,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = mesh.receiveShadow = true;
  scene.add(mesh);
  animBuildings.push({ mesh, baseH: h, phase: Math.random() * Math.PI * 2 });

  // Window grid
  addWindows(mesh, x, h, z, w, d, city);

  // Rooftop antenna
  if (h > 18 && Math.random() < .5) addAntenna(x, h, z);
}

function addWindows(building, x, h, z, w, d, city) {
  const winColor = city.level === 'hot'
    ? (Math.random() < .3 ? 0xff6600 : 0xffaa00)
    : city.level === 'moderate'
    ? (Math.random() < .5 ? 0x4488ff : 0x88aaff)
    : 0x88ccff;

  const rows = Math.floor(h / 2.5), cols = Math.floor(w / 1.8);
  const winGeo = new THREE.PlaneGeometry(.6, .8);
  const winMat = new THREE.MeshStandardMaterial({
    color: winColor, emissive: winColor, emissiveIntensity: .7,
    roughness: .2, metalness: .8,
  });
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < .25) continue;
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(
        x - w / 2 + 1 + c * 1.8,
        r * 2.5 + 1.5,
        z + d / 2 + .01
      );
      scene.add(win);
    }
  }
}

function addAntenna(x, h, z) {
  const mat  = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const ant  = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 6, 6), mat);
  ant.position.set(x, h + 3, z);
  scene.add(ant);
  // Beacon
  const bMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 1 });
  const bea  = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 8), bMat);
  bea.position.set(x, h + 6.2, z);
  scene.add(bea);
  animBuildings.push({ mesh: bea, isBeacon: true, phase: Math.random() * Math.PI * 2 });
}

function addTree(x, z, city) {
  const trunkMat  = new THREE.MeshStandardMaterial({ color: 0x5a3010, roughness: .9 });
  const trunkH    = 1 + Math.random() * 2;
  const trunk     = new THREE.Mesh(new THREE.CylinderGeometry(.15, .2, trunkH, 6), trunkMat);
  trunk.position.set(x, trunkH / 2, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const leafCol = city.level === 'hot'     ? 0x3d6b00
                : city.level === 'moderate'? 0x2d7a30
                :                           0x1a5a40;
  const leafMat = new THREE.MeshStandardMaterial({ color: leafCol, roughness: .8 });
  const leafR   = .8 + Math.random() * 1.2;
  const leaf    = new THREE.Mesh(new THREE.SphereGeometry(leafR, 8, 8), leafMat);
  leaf.position.set(x, trunkH + leafR * .7, z);
  leaf.castShadow = true;
  scene.add(leaf);
  animBuildings.push({ mesh: leaf, isTree: true, phase: Math.random() * Math.PI * 2 });
}

function addWater() {
  const geo = new THREE.PlaneGeometry(40, 40, 30, 30);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x0044aa, roughness: .1, metalness: .8,
    transparent: true, opacity: .8,
    emissive: 0x001133, emissiveIntensity: .4,
  });
  const water = new THREE.Mesh(geo, mat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(50, .05, 0);
  scene.add(water);
  waterMeshes.push(water);
}

function addParticles(city) {
  const count = city.level === 'hot' ? 500 : 200;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - .5) * 100;
    pos[i * 3 + 1] = Math.random() * 60;
    pos[i * 3 + 2] = (Math.random() - .5) * 100;
    sizes[i]       = .3 + Math.random() * .5;
    particleVelocities.push({
      x: (Math.random() - .5) * .02,
      y:  .02 + Math.random() * .04,
      z: (Math.random() - .5) * .02,
    });
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const col = city.level === 'hot' ? 0xff4400 : city.level === 'cool' ? 0xaaddff : 0x44aaff;
  const mat = new THREE.PointsMaterial({ color: col, size: .4, transparent: true, opacity: .6 });
  particles = new THREE.Points(geo, mat);
  scene.add(particles);
}

function addHeatHaze() {
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.PlaneGeometry(15, 20);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff4400, transparent: true, opacity: .015,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const haze = new THREE.Mesh(geo, mat);
    haze.position.set((Math.random() - .5) * 60, 10 + Math.random() * 20, (Math.random() - .5) * 60);
    haze.rotation.y = Math.random() * Math.PI;
    scene.add(haze);
    animBuildings.push({ mesh: haze, isHaze: true, phase: Math.random() * Math.PI * 2 });
  }
}

function addStars() {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(600 * 3);
  for (let i = 0; i < 600; i++) {
    pos[i * 3]     = (Math.random() - .5) * 400;
    pos[i * 3 + 1] = 50 + Math.random() * 200;
    pos[i * 3 + 2] = (Math.random() - .5) * 400;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: .3, transparent: true, opacity: .7 })));
}

/* ──────────────────────────────────────
   CAMERA / CONTROLS
────────────────────────────────────── */
function positionCamera() {
  const x = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);
  camera.position.set(x + target.x, y + target.y, z + target.z);
  camera.lookAt(target);
}

function setupOrbitControls() {
  const c3d = document.getElementById('c3d');

  c3d.addEventListener('mousedown', e => {
    isDrag  = true;
    isRight = e.button === 2;
    prev    = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => { isDrag = false; });

  window.addEventListener('mousemove', e => {
    if (!isDrag) return;
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    prev = { x: e.clientX, y: e.clientY };
    if (isRight) {
      const right = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.cross(camera.up).normalize().multiplyScalar(-dx * .05);
      const up = new THREE.Vector3(0, 1, 0).multiplyScalar(dy * .05);
      target.add(right).add(up);
    } else {
      theta -= dx * .005;
      phi    = Math.max(.1, Math.min(Math.PI - .1, phi + dy * .005));
    }
    positionCamera();
  });

  c3d.addEventListener('wheel', e => {
    radius = Math.max(15, Math.min(200, radius + e.deltaY * .05));
    positionCamera();
  });

  c3d.addEventListener('contextmenu', e => e.preventDefault());
}

/* ──────────────────────────────────────
   ANIMATE LOOP
────────────────────────────────────── */
function animate(city) {
  animId = requestAnimationFrame(() => animate(city));
  const t = clock.getElapsedTime();
  frameN++;

  // Particles
  if (particles) {
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleVelocities.length; i++) {
      pos[i * 3]     += particleVelocities[i].x;
      pos[i * 3 + 1] += particleVelocities[i].y;
      pos[i * 3 + 2] += particleVelocities[i].z;
      if (pos[i * 3 + 1] > 60) { pos[i * 3 + 1] = 0; }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += .0003;
  }

  // Water wave
  waterMeshes.forEach(w => {
    w.position.y = .05 + Math.sin(t * .8) * .1;
    w.rotation.z = Math.sin(t * .3) * .02;
  });

  // Per-object animations
  animBuildings.forEach(obj => {
    if (obj.isTree)   { obj.mesh.rotation.z = Math.sin(t * 1.2 + obj.phase) * .04; return; }
    if (obj.isBeacon) { obj.mesh.material.emissiveIntensity = .5 + .5 * Math.sin(t * 3 + obj.phase); return; }
    if (obj.isHaze)   { obj.mesh.material.opacity = .008 + .01 * Math.sin(t * .5 + obj.phase); return; }
  });

  renderer.render(scene, camera);
}

/* ──────────────────────────────────────
   GO BACK
────────────────────────────────────── */
function goBack() {
  if (animId)   cancelAnimationFrame(animId);
  if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
  waterMeshes = []; animBuildings = []; particleVelocities = [];

  document.getElementById('scene3d').style.display  = 'none';
  document.getElementById('mapWrap').style.display  = 'block';
  document.getElementById('backBtn').style.display  = 'none';
  document.getElementById('wp').style.display       = 'none';
  document.getElementById('inst').style.display     = 'block';
  document.getElementById('ctrl3d').style.display   = 'none';
  document.getElementById('zoneHud').style.display  = 'none';
}

/* ── Resize 3D canvas ── */
window.addEventListener('resize', () => {
  if (!renderer) return;
  const c = document.getElementById('c3d');
  const W = c.offsetWidth, H = c.offsetHeight;
  renderer.setSize(W, H);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
});