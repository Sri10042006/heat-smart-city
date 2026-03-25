/* ════════════════════════════════════════
   URBAN SMART CITY CLIMATE PREDICTOR
   js/data.js  —  City dataset & advisories
════════════════════════════════════════ */

const CITIES = [
  { name:"New Delhi, India",     lat:28.6,  lng:77.2,  temp:39, hum:20, wind:"18 km/h NW", uv:10, level:"hot",      cond:"Very Hot" },
  { name:"Dubai, UAE",           lat:25.2,  lng:55.3,  temp:44, hum:42, wind:"22 km/h W",  uv:11, level:"hot",      cond:"Extreme Heat" },
  { name:"Cairo, Egypt",         lat:30.1,  lng:31.2,  temp:38, hum:28, wind:"14 km/h N",  uv:10, level:"hot",      cond:"Hot & Dry" },
  { name:"Bangkok, Thailand",    lat:13.8,  lng:100.5, temp:36, hum:84, wind:"10 km/h S",  uv:9,  level:"hot",      cond:"Very Hot & Humid" },
  { name:"Lagos, Nigeria",       lat:6.5,   lng:3.4,   temp:33, hum:87, wind:"16 km/h SW", uv:8,  level:"hot",      cond:"Hot & Humid" },
  { name:"Riyadh, Saudi Arabia", lat:24.7,  lng:46.7,  temp:46, hum:12, wind:"20 km/h NE", uv:11, level:"hot",      cond:"Extremely Hot" },
  { name:"Chennai, India",       lat:13.1,  lng:80.3,  temp:37, hum:78, wind:"12 km/h SE", uv:9,  level:"hot",      cond:"Hot & Humid" },
  { name:"Mumbai, India",        lat:19.1,  lng:72.9,  temp:34, hum:74, wind:"19 km/h SW", uv:7,  level:"moderate", cond:"Warm & Humid" },
  { name:"Tokyo, Japan",         lat:35.7,  lng:139.7, temp:28, hum:69, wind:"15 km/h E",  uv:6,  level:"moderate", cond:"Warm & Partly Cloudy" },
  { name:"New York, USA",        lat:40.7,  lng:-74.0, temp:22, hum:60, wind:"24 km/h W",  uv:5,  level:"moderate", cond:"Partly Cloudy" },
  { name:"Sydney, Australia",    lat:-33.9, lng:151.2, temp:26, hum:64, wind:"18 km/h SE", uv:6,  level:"moderate", cond:"Sunny & Warm" },
  { name:"Los Angeles, USA",     lat:34.1,  lng:-118.2,temp:29, hum:34, wind:"11 km/h SW", uv:7,  level:"moderate", cond:"Sunny & Warm" },
  { name:"Beijing, China",       lat:39.9,  lng:116.4, temp:30, hum:48, wind:"16 km/h NW", uv:7,  level:"moderate", cond:"Warm & Hazy" },
  { name:"São Paulo, Brazil",    lat:-23.5, lng:-46.6, temp:25, hum:80, wind:"13 km/h NE", uv:5,  level:"moderate", cond:"Warm & Rainy" },
  { name:"London, UK",           lat:51.5,  lng:-0.1,  temp:14, hum:74, wind:"22 km/h SW", uv:3,  level:"cool",     cond:"Mild & Cloudy" },
  { name:"Moscow, Russia",       lat:55.8,  lng:37.6,  temp:4,  hum:82, wind:"18 km/h N",  uv:2,  level:"cool",     cond:"Cold & Overcast" },
  { name:"Reykjavik, Iceland",   lat:64.1,  lng:-21.9, temp:3,  hum:88, wind:"35 km/h SW", uv:2,  level:"cool",     cond:"Cool & Windy" },
  { name:"Toronto, Canada",      lat:43.7,  lng:-79.4, temp:9,  hum:63, wind:"20 km/h N",  uv:3,  level:"cool",     cond:"Cold & Partly Cloudy" },
  { name:"Berlin, Germany",      lat:52.5,  lng:13.4,  temp:12, hum:70, wind:"17 km/h W",  uv:3,  level:"cool",     cond:"Cool & Cloudy" },
  { name:"Paris, France",        lat:48.9,  lng:2.3,   temp:16, hum:71, wind:"19 km/h W",  uv:4,  level:"cool",     cond:"Mild & Rainy" },
];

const ADV = {
  hot: [
    "🌊 Drink water every 30 min — stay hydrated",
    "🏠 Avoid outdoors 11am–4pm — UV is extreme",
    "❄️ Use AC or fans — reduce indoor heat",
    "🌳 Plant trees in red zones to absorb heat",
    "🏗️ Apply cool-roof coatings on buildings",
    "🚗 Avoid idling vehicles — reduces heat island",
  ],
  moderate: [
    "💧 Stay moderately hydrated throughout the day",
    "🌬️ Open windows in early morning for cross-breeze",
    "🌿 Maintain urban green cover & parks",
    "🌡️ Monitor for heat spikes in afternoons",
    "🚶 Outdoor activity fine — wear sunscreen",
  ],
  cool: [
    "🧥 Dress in warm layers when going outside",
    "☀️ Enjoy outdoor activities — low UV today",
    "💧 Hydrate even in cool conditions",
    "🏃 Great conditions for exercise & sports",
    "🔥 Ensure heating systems are maintained",
  ],
};
