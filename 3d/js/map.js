/* ════════════════════════════════════════
   URBAN SMART CITY CLIMATE PREDICTOR
   js/map.js  — Real Political Map (Leaflet)
   Genuine tile-based map like Google Maps
════════════════════════════════════════ */

let leafletMap = null;
let markerLayer = null;

/* ── INIT MAP ── */
function initMap() {
  leafletMap = L.map('leafletMap', {
    center: [20, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    zoomControl: true,
    attributionControl: true,
  });

  // CartoDB Dark Matter — real political map, country borders, roads, place names
  const cartoDark = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }
  );

  // Stadia Alidade Smooth Dark — another real political dark map
  const stadiaDark = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }
  );

  // CartoDB Voyager — lighter political map option  
  const cartoVoyager = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }
  );

  // Default: CartoDB Dark
  cartoDark.addTo(leafletMap);

  // Layer switcher
  const baseMaps = {
    '🌑 Dark Political (Default)': cartoDark,
    '🌙 Stadia Dark':              stadiaDark,
    '🗺️ Voyager (Light)':         cartoVoyager,
  };
  L.control.layers(baseMaps, null, { position: 'bottomleft' }).addTo(leafletMap);

  addCityMarkers();
  leafletMap.on('click', onMapClick);
}

/* ── CUSTOM SVG MARKER ICONS ── */
function makeIcon(city) {
  const col      = city.level === 'hot'      ? '#ff3333' : city.level === 'moderate' ? '#ffaa00' : '#00d4ff';
  const glowRgba = city.level === 'hot'      ? '255,50,50' : city.level === 'moderate' ? '255,170,0' : '0,212,255';
  const id       = 'gf' + Math.random().toString(36).slice(2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="54" viewBox="0 0 42 54">
    <defs>
      <radialGradient id="${id}g" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${col}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
      </radialGradient>
      <filter id="${id}f"><feGaussianBlur stdDeviation="2.5"/></filter>
    </defs>
    <ellipse cx="21" cy="21" rx="18" ry="18" fill="url(#${id}g)"/>
    <circle cx="21" cy="20" r="11" fill="${col}" filter="url(#${id}f)" opacity="0.5"/>
    <circle cx="21" cy="20" r="10" fill="${col}" stroke="rgba(255,255,255,0.75)" stroke-width="2"/>
    <polygon points="21,50 13,30 29,30" fill="${col}" opacity="0.85"/>
    <circle cx="21" cy="20" r="4" fill="white" opacity="0.95"/>
  </svg>`;

  return L.divIcon({
    className: '',
    html: `<div style="position:relative;cursor:pointer">
             ${svg}
             <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);
               white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;
               color:rgba(230,245,255,0.95);text-shadow:0 1px 5px rgba(0,0,0,1),0 0 10px rgba(0,0,0,0.9);
               pointer-events:none;letter-spacing:0.3px;">
               ${city.name.split(',')[0]}
             </div>
           </div>`,
    iconSize:   [42, 54],
    iconAnchor: [21, 50],
    popupAnchor:[0, -52],
  });
}

/* ── ADD MARKERS + HEAT HALOS ── */
function addCityMarkers() {
  markerLayer = L.layerGroup().addTo(leafletMap);

  // Heat halos for hot cities
  CITIES.filter(c => c.level === 'hot').forEach(city => {
    L.circle([city.lat, city.lng], {
      radius:      700000,
      color:       '#ff3300',
      fillColor:   '#ff3300',
      fillOpacity: 0.055,
      weight:      1,
      dashArray:   '4 6',
    }).addTo(leafletMap);
  });

  // Markers
  CITIES.forEach(city => {
    const col = city.level === 'hot' ? '#ff4444' : city.level === 'moderate' ? '#ffbb00' : '#00d4ff';
    const badge = city.level === 'hot' ? '🔴 HOT ZONE' : city.level === 'moderate' ? '🟠 MODERATE' : '🔵 COOL ZONE';

    const marker = L.marker([city.lat, city.lng], {
      icon:  makeIcon(city),
      title: city.name,
    });

    marker.bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;min-width:190px;">
        <div style="font-weight:700;font-size:13px;color:#fff;margin-bottom:5px">${city.name}</div>
        <div style="color:${col};font-weight:700;font-size:11px;margin-bottom:9px;letter-spacing:1px">${badge}</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:11.5px;color:#9bc">
          <span>🌡️ Temp</span>     <b style="color:#fff">${city.temp}°C</b>
          <span>💧 Humidity</span>  <b style="color:#fff">${city.hum}%</b>
          <span>🌤️ Condition</span> <b style="color:#fff">${city.cond}</b>
          <span>💨 Wind</span>      <b style="color:#fff">${city.wind}</b>
          <span>☀️ UV Index</span>  <b style="color:#fff">${city.uv}</b>
        </div>
        <button onclick="window._openCity('${city.name}')"
          style="margin-top:11px;width:100%;padding:8px 0;background:${col};
                 border:none;border-radius:7px;color:#000;font-weight:800;
                 font-size:11px;letter-spacing:1.5px;cursor:pointer;
                 font-family:'DM Sans',sans-serif;transition:filter .2s"
          onmouseover="this.style.filter='brightness(1.25)'"
          onmouseout="this.style.filter='brightness(1)'">
          🏙 VIEW 3D CITY →
        </button>
      </div>`, { className: 'climate-popup', maxWidth: 230 });

    markerLayer.addLayer(marker);
  });

  // Global handler for popup button
  window._openCity = (name) => {
    const city = CITIES.find(c => c.name === name);
    if (city) { leafletMap.closePopup(); launch3D(city); }
  };
}

/* ── MAP CLICK HANDLER ── */
function onMapClick(e) {
  // Ignore if popup is open
  if (document.querySelector('.leaflet-popup')) return;

  const { lat, lng } = e.latlng;
  const dist = c => Math.hypot(c.lat - lat, c.lng - lng);
  const nearest = CITIES.reduce((a, b) => dist(a) < dist(b) ? a : b);

  if (dist(nearest) < 6) {
    launch3D(nearest);
    return;
  }

  // Unknown region — synth data from nearest
  launch3D({
    ...nearest,
    name: `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`,
    temp: nearest.temp + Math.round((Math.random() - .5) * 6),
    hum:  Math.max(10, Math.min(95, nearest.hum + Math.round((Math.random() - .5) * 12))),
    wind: `${8 + Math.round(Math.random() * 22)} km/h`,
  });
}

/* ── SEARCH ── */
document.getElementById('searchBtn').onclick = doSearch;
document.getElementById('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});
function doSearch() {
  const q = document.getElementById('cityInput').value.trim().toLowerCase();
  if (!q) return;
  const city = CITIES.find(c => c.name.toLowerCase().includes(q));
  if (city) {
    leafletMap.flyTo([city.lat, city.lng], 5, { duration: 1.2 });
    setTimeout(() => launch3D(city), 1400);
  } else {
    alert('City not found. Try: New Delhi, Dubai, London, Tokyo…');
  }
}

/* ── DARK THEME INJECTION FOR LEAFLET WIDGETS ── */
const _s = document.createElement('style');
_s.textContent = `
  #leafletMap { position:absolute; inset:0; width:100%; height:100%; background:#030b1c; }
  .climate-popup .leaflet-popup-content-wrapper {
    background:rgba(3,11,28,0.97)!important;
    border:1px solid rgba(0,207,255,0.28)!important;
    border-radius:12px!important;
    box-shadow:0 12px 40px rgba(0,0,0,0.85),0 0 24px rgba(0,150,255,0.12)!important;
    color:#ddf0ff;
  }
  .climate-popup .leaflet-popup-content { margin:14px 16px; }
  .climate-popup .leaflet-popup-tip { background:rgba(3,11,28,0.97)!important; }
  .climate-popup .leaflet-popup-close-button { color:rgba(0,207,255,0.65)!important; font-size:18px!important; top:8px!important; right:10px!important; }
  .climate-popup .leaflet-popup-close-button:hover { color:#00cfff!important; }
  .leaflet-control-layers {
    background:rgba(3,11,28,0.93)!important;
    border:1px solid rgba(0,207,255,0.18)!important;
    border-radius:10px!important; color:#aaddff!important;
    box-shadow:0 4px 20px rgba(0,0,0,0.6)!important;
  }
  .leaflet-control-layers-toggle { background-color:rgba(0,207,255,0.12)!important; }
  .leaflet-control-layers label { color:#aaddff!important; font-family:'DM Sans',sans-serif!important; font-size:12px!important; }
  .leaflet-control-zoom a {
    background:rgba(3,11,28,0.92)!important;
    border-color:rgba(0,207,255,0.2)!important;
    color:#00cfff!important; font-size:18px!important;
  }
  .leaflet-control-zoom a:hover { background:rgba(0,150,255,0.18)!important; }
  .leaflet-control-attribution { background:rgba(2,8,22,0.65)!important; color:rgba(100,160,220,0.45)!important; font-size:9px!important; }
  .leaflet-control-attribution a { color:rgba(0,200,255,0.5)!important; }
  .leaflet-attribution-flag { display:none!important; }
`;
document.head.appendChild(_s);

/* ── BOOT ── */
initMap();