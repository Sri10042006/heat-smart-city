/* ════════════════════════════════════════
   URBAN SMART CITY CLIMATE PREDICTOR
   js/map.js  —  2D World Map (Canvas)
════════════════════════════════════════ */

const mapCanvas = document.getElementById('mapCanvas');
const ctx       = mapCanvas.getContext('2d');
let MW, MH;

/* ── Coordinate helpers ── */
function ll2xy(lat, lng) {
  const x = (lng + 180) / 360 * MW;
  const r = lat * Math.PI / 180;
  const n = Math.log(Math.tan(Math.PI / 4 + r / 2));
  const y = (Math.PI - n) / (2 * Math.PI) * MH;
  return { x, y };
}

function xy2ll(x, y) {
  const lng = x / MW * 360 - 180;
  const n   = Math.PI - 2 * Math.PI * y / MH;
  const lat = 180 / Math.PI * Math.atan(.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

/* ── Resize ── */
function resizeMap() {
  MW = mapCanvas.offsetWidth;
  MH = mapCanvas.offsetHeight;
  mapCanvas.width  = MW;
  mapCanvas.height = MH;
  drawMap();
}

/* ── Continents ── */
function drawContinents() {
  ctx.fillStyle   = 'rgba(25,75,40,.5)';
  ctx.strokeStyle = 'rgba(60,140,80,.28)';
  ctx.lineWidth   = 1;

  const shapes = [
    // N America
    [[70,-141],[83,-72],[72,-82],[60,-64],[45,-53],[24,-80],[18,-88],[15,-85],[20,-106],[28,-111],[32,-117],[24,-125]],
    // S America
    [[-4,-81],[12,-71],[10,-62],[-5,-35],[-22,-43],[-33,-70],[-55,-65],[-54,-68]],
    // Europe
    [[36,-9],[36,28],[55,8],[51,-3],[45,-1],[44,2],[42,-9],[38,-9],[36,-6],[40,28],[55,28],[70,28],[71,26],[60,28]],
    // Africa
    [[37,-6],[37,36],[12,42],[-5,40],[-35,27],[-35,18],[-5,12],[5,0],[4,-8],[14,-17],[27,-16]],
    // Asia
    [[36,28],[42,28],[55,35],[70,60],[75,110],[70,140],[45,145],[22,115],[8,98],[9,78],[22,72],[26,57],[30,55],[36,59]],
    // SE Asia
    [[5,100],[22,120],[10,125],[0,110],[5,100]],
    // Australia
    [[-15,129],[-38,141],[-38,147],[-28,154],[-20,148],[-12,135],[-18,122]],
    // Greenland
    [[60,-44],[84,-30],[83,-24],[76,-18],[72,-22],[60,-44]],
    // Japan
    [[31,130],[45,141],[43,145],[34,136],[31,130]],
    // UK
    [[50,-5],[58,-3],[58,1],[51,1],[50,-5]],
    // Indonesia
    [[-8,107],[-6,116],[-8,116],[-10,108],[-8,107]],
  ];

  shapes.forEach(poly => {
    ctx.beginPath();
    const pts = poly.map(([la, ln]) => ll2xy(la, ln));
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

/* ── Full map draw ── */
function drawMap() {
  // Ocean gradient
  const og = ctx.createLinearGradient(0, 0, 0, MH);
  og.addColorStop(0,   '#03102a');
  og.addColorStop(.5,  '#051630');
  og.addColorStop(1,   '#020c1e');
  ctx.fillStyle = og;
  ctx.fillRect(0, 0, MW, MH);

  // Grid
  ctx.strokeStyle = 'rgba(0,100,200,.06)';
  ctx.lineWidth   = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const { y } = ll2xy(lat, 0);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MW, y); ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 30) {
    const { x } = ll2xy(0, lng);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MH); ctx.stroke();
  }

  drawContinents();

  // Hot-zone halos
  CITIES.filter(c => c.level === 'hot').forEach(c => {
    const { x, y } = ll2xy(c.lat, c.lng);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, 36);
    rg.addColorStop(0, 'rgba(255,60,0,.22)');
    rg.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(x, y, 36, 0, Math.PI * 2); ctx.fill();
  });

  // City pins
  CITIES.forEach(c => {
    const { x, y } = ll2xy(c.lat, c.lng);
    const col = c.level === 'hot' ? '#ff3333' : c.level === 'moderate' ? '#ffaa00' : '#00d4ff';

    // Glow
    const gl = ctx.createRadialGradient(x, y, 0, x, y, 20);
    gl.addColorStop(0, col + '44'); gl.addColorStop(1, col + '00');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();

    // Pin dot
    ctx.shadowColor = col; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle   = col; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.shadowBlur  = 0;

    // Label
    ctx.font      = 'bold 10px "DM Sans",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(230,245,255,.88)';
    ctx.fillText(c.name.split(',')[0], x, y - 12);
  });
}

/* ── Tooltip ── */
const tip = document.getElementById('tip');
let hovered = null;

mapCanvas.addEventListener('mousemove', e => {
  const r  = mapCanvas.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  hovered  = null;

  for (const c of CITIES) {
    const { x, y } = ll2xy(c.lat, c.lng);
    if (Math.hypot(mx - x, my - y) < 16) { hovered = c; break; }
  }

  if (hovered) {
    tip.style.display = 'block';
    tip.style.left    = (e.clientX + 14) + 'px';
    tip.style.top     = (e.clientY - 8)  + 'px';
    const col = hovered.level === 'hot' ? '#ff4444' : hovered.level === 'moderate' ? '#ffbb00' : '#00d4ff';
    tip.innerHTML = `<strong>${hovered.name}</strong><br><span style="color:${col}">${hovered.temp}°C · ${hovered.cond}</span>`;
    mapCanvas.style.cursor = 'pointer';
  } else {
    tip.style.display      = 'none';
    mapCanvas.style.cursor = 'crosshair';
  }
});

mapCanvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

mapCanvas.addEventListener('click', e => {
  const r  = mapCanvas.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  let clicked = null;

  for (const c of CITIES) {
    const { x, y } = ll2xy(c.lat, c.lng);
    if (Math.hypot(mx - x, my - y) < 18) { clicked = c; break; }
  }

  if (!clicked) {
    const { lat, lng } = xy2ll(mx, my);
    const d       = c => Math.hypot(c.lat - lat, c.lng - lng);
    const nearest = CITIES.reduce((a, b) => d(a) < d(b) ? a : b);
    clicked = {
      ...nearest,
      name: `${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E`,
      temp: nearest.temp + Math.round((Math.random() - .5) * 5),
      hum:  Math.max(10, Math.min(95, nearest.hum + Math.round((Math.random() - .5) * 10))),
      wind: `${10 + Math.round(Math.random() * 20)} km/h`,
    };
  }

  tip.style.display = 'none';
  launch3D(clicked);   // defined in scene3d.js
});

/* ── Search ── */
document.getElementById('searchBtn').onclick = doSearch;
document.getElementById('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const q = document.getElementById('cityInput').value.trim().toLowerCase();
  if (!q) return;
  const f = CITIES.find(c => c.name.toLowerCase().includes(q));
  if (f) launch3D(f);
  else   alert('City not found. Try: New Delhi, Dubai, London, Tokyo…');
}

/* ── Init ── */
window.addEventListener('resize', resizeMap);
resizeMap();