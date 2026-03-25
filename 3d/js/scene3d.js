/* ════════════════════════════════════════
   URBAN SMART CITY CLIMATE PREDICTOR
   js/scene3d.js  —  Realistic 3D City View
   • Real building colours — no coloured sky
   • City-specific architecture per region
   • Heat shown only as subtle building tint
   • Natural daylight sky + real clouds
════════════════════════════════════════ */

let renderer, scene, camera, animId, clock;
let isDrag = false, isRight = false, prev = { x:0, y:0 };
let theta = 0.72, phi = 1.08, radius = 90;
let target = new THREE.Vector3(0,0,0);
let particles, particleVelocities = [], waterMeshes = [], animBuildings = [];

/* ══════════════════════════════════════
   CITY ARCHITECTURE PROFILES
══════════════════════════════════════ */
const CITY_PROFILES = {
  'Dubai':    { style:'gulf_modern',         sky:{ top:'#87ceeb', horizon:'#d4e8f5' }, groundColor:0xc8a96e, roadColor:0x887060, wallColors:[0xf5f0e8,0xe8dfc8,0xffffff,0xd4c8a8], glassColors:[0x88bbdd,0x66aacc,0x44aabb], treeType:'palm',      landmarks:['burj_tower','sail_tower'] },
  'Riyadh':   { style:'gulf_modern',         sky:{ top:'#87ceeb', horizon:'#e8d5a0' }, groundColor:0xc4a06a, roadColor:0x857860, wallColors:[0xf2ede0,0xe5d9c0,0xfaf5ec,0xd8cbb0], glassColors:[0x99ccdd,0x77bbcc],         treeType:'palm',      landmarks:['kingdom_tower','minaret'] },
  'Cairo':    { style:'arabic_historic',     sky:{ top:'#90c8e8', horizon:'#e0c87a' }, groundColor:0xb8956a, roadColor:0x8a7055, wallColors:[0xe8d5a0,0xd4b880,0xc8a860,0xdcc890], glassColors:[0x99ccaa,0x88bb99],         treeType:'palm',      landmarks:['minaret','flat_roof_block'] },
  'New Delhi':{ style:'south_asian',         sky:{ top:'#9bbbd4', horizon:'#d4b888' }, groundColor:0x8a7055, roadColor:0x706050, wallColors:[0xf0c870,0xe8b850,0xd4a840,0xf4d080], glassColors:[0x77aacc,0x88bbcc],         treeType:'banyan',    landmarks:['temple_dome','colonial_arch'] },
  'Mumbai':   { style:'south_asian',         sky:{ top:'#9bbbd4', horizon:'#c8c0a0' }, groundColor:0x7a6850, roadColor:0x605040, wallColors:[0xd4b880,0xe8d0a0,0xb89060,0xc8a870], glassColors:[0x6699bb,0x77aacc],         treeType:'banyan',    landmarks:['victorian_arch'] },
  'Chennai':  { style:'south_asian',         sky:{ top:'#88b8d4', horizon:'#c0c0a0' }, groundColor:0x7a7055, roadColor:0x605848, wallColors:[0xe8d090,0xd4b870,0xc8a858,0xdcc080], glassColors:[0x55aacc,0x66bbcc],         treeType:'banyan',    landmarks:['temple_dome'] },
  'Bangkok':  { style:'southeast_asian',     sky:{ top:'#88c4d8', horizon:'#c0d8b0' }, groundColor:0x6a8855, roadColor:0x507040, wallColors:[0xf0e0b0,0xe8d090,0xfff8e0,0xd4c080], glassColors:[0x55bbaa,0x44ccaa,0x66ddbb],treeType:'tropical',  landmarks:['temple_spire','pagoda'] },
  'Lagos':    { style:'west_african',        sky:{ top:'#88c0cc', horizon:'#c0d4a0' }, groundColor:0x6a8850, roadColor:0x4a6835, wallColors:[0xf4d080,0xe8c060,0xfff0a0,0xddb850], glassColors:[0x55ccaa,0x44bbaa],         treeType:'tropical',  landmarks:['flat_roof_block'] },
  'Tokyo':    { style:'east_asian_modern',   sky:{ top:'#6090c0', horizon:'#a8c0d8' }, groundColor:0x485850, roadColor:0x383838, wallColors:[0xc8c8c8,0xd8d8d8,0xb8b8c8,0xe0e0e0], glassColors:[0x4488cc,0x3377bb,0x5599dd], treeType:'cherry',   landmarks:['tokyo_tower','pagoda'] },
  'Beijing':  { style:'east_asian_mix',      sky:{ top:'#7090b0', horizon:'#b0b8c0' }, groundColor:0x4a5848, roadColor:0x353535, wallColors:[0xc0c0b8,0xd0c8b0,0xe0d8c0,0xb8b0a0], glassColors:[0x4488bb,0x5599cc],         treeType:'pine',      landmarks:['pagoda','gate_tower'] },
  'New York': { style:'north_american_metro',sky:{ top:'#5080b0', horizon:'#90aac8' }, groundColor:0x404040, roadColor:0x282828, wallColors:[0x8090a0,0x7080a0,0x6070a0,0x9098a8], glassColors:[0x4488cc,0x5599dd,0x335588], treeType:'deciduous', landmarks:['empire_skyscraper','water_tower'] },
  'Los Angeles':{ style:'west_coast_usa',    sky:{ top:'#6090cc', horizon:'#a8c8e8' }, groundColor:0x707060, roadColor:0x484840, wallColors:[0xe8e0d0,0xd8d0c0,0xf0e8d8,0xc8c0b0], glassColors:[0x55aadd,0x66bbee,0x44aacc],treeType:'palm',     landmarks:['low_rise_block'] },
  'Toronto':  { style:'north_american_metro',sky:{ top:'#5070a0', horizon:'#8898c0' }, groundColor:0x3a4a3a, roadColor:0x252525, wallColors:[0x8898a8,0x7888a0,0x606878,0x909aaa], glassColors:[0x4488cc,0x3377bb],         treeType:'deciduous', landmarks:['cn_tower_style'] },
  'São Paulo':{ style:'latin_american',      sky:{ top:'#6098b8', horizon:'#a8c8b0' }, groundColor:0x506040, roadColor:0x404030, wallColors:[0xd0d0c0,0xc0c8b0,0xe0d8c8,0xb8c0b0], glassColors:[0x44aacc,0x55bbdd],         treeType:'tropical',  landmarks:['glass_box'] },
  'London':   { style:'european_mixed',      sky:{ top:'#6880a8', horizon:'#a0aec0' }, groundColor:0x404838, roadColor:0x303030, wallColors:[0xb0a090,0xc0b0a0,0xa09080,0xd0c0b0], glassColors:[0x5588bb,0x4477aa,0x6699cc], treeType:'deciduous', landmarks:['victorian_arch','glass_shard'] },
  'Paris':    { style:'european_classic',    sky:{ top:'#708ab8', horizon:'#a8b8cc' }, groundColor:0x4a503a, roadColor:0x383838, wallColors:[0xe0d4c0,0xd4c8b0,0xece0cc,0xd8ccb8], glassColors:[0x6688aa,0x7799bb],         treeType:'deciduous', landmarks:['eiffel_style','haussmann_block'] },
  'Berlin':   { style:'european_modern',     sky:{ top:'#607898', horizon:'#9098b0' }, groundColor:0x384038, roadColor:0x282828, wallColors:[0x909898,0xa0a8a8,0x808888,0xb0b8b8], glassColors:[0x4488bb,0x5599cc,0x3377aa], treeType:'pine',     landmarks:['bauhaus_block'] },
  'Moscow':   { style:'eastern_european',    sky:{ top:'#4860a0', horizon:'#7888b0' }, groundColor:0x303828, roadColor:0x222222, wallColors:[0x909090,0xa0a0a0,0x808080,0xb0b0b0], glassColors:[0x3366aa,0x4477bb],         treeType:'pine',      landmarks:['onion_dome','soviet_block','stalin_spire'] },
  'Reykjavik':{ style:'nordic',              sky:{ top:'#607888', horizon:'#90a8b8' }, groundColor:0x3a4838, roadColor:0x2a2a2a, wallColors:[0xd0d8e0,0xc8d0d8,0xe0e8f0,0xb8c0c8], glassColors:[0x4488aa,0x55aacc],        treeType:'pine',      landmarks:['church_spire','colorful_house'] },
};

function getProfile(city) {
  const key = Object.keys(CITY_PROFILES).find(k => city.name.toLowerCase().includes(k.toLowerCase()));
  if (key) return CITY_PROFILES[key];
  return city.level==='hot' ? CITY_PROFILES['Dubai'] : city.level==='cool' ? CITY_PROFILES['London'] : CITY_PROFILES['New York'];
}

/* Heat tint — warm red push at high temps, blue at cold */
function heatTint(baseHex, temp) {
  const r=(baseHex>>16)&0xff, g=(baseHex>>8)&0xff, b=baseHex&0xff;
  const heat=Math.max(0,Math.min(1,(temp-10)/40));
  return (Math.min(255,Math.round(r+heat*25))<<16)|(Math.max(0,Math.round(g-heat*10))<<8)|Math.max(0,Math.round(b-heat*18));
}

/* ══════════════════════════════════════  LAUNCH  ══════════════════════════════════════ */
function launch3D(city) {
  showWeatherPanel(city);
  document.getElementById('mapWrap').style.display='none';
  document.getElementById('scene3d').style.display='block';
  document.getElementById('backBtn').style.display='block';
  document.getElementById('inst').style.display='none';
  document.getElementById('ctrl3d').style.display='block';
  document.getElementById('zoneHud').style.display='flex';
  if(renderer){renderer.dispose();renderer.forceContextLoss();}
  if(animId) cancelAnimationFrame(animId);
  waterMeshes=[];animBuildings=[];particleVelocities=[];
  theta=0.72;phi=1.08;radius=90;target=new THREE.Vector3(0,0,0);
  buildScene(city);
}

/* ══════════════════════════════════════  WEATHER PANEL  ══════════════════════════════════════ */
function showWeatherPanel(city) {
  document.getElementById('wpCity').textContent=city.name;
  document.getElementById('wpTemp').textContent=city.temp+'°C';
  document.getElementById('wpHum').textContent=city.hum+'%';
  document.getElementById('wpCond').textContent=city.cond;
  document.getElementById('wpWind').textContent=city.wind;
  document.getElementById('wpUv').textContent=city.uv;
  const badge=document.getElementById('wpBadge');
  const S={hot:{bg:'rgba(255,50,50,.18)',border:'#ff4444',color:'#ff6666',label:'🔴 HOT ZONE'},moderate:{bg:'rgba(255,170,0,.18)',border:'#ffaa00',color:'#ffcc44',label:'🟠 MODERATE'},cool:{bg:'rgba(0,200,255,.18)',border:'#00cfff',color:'#00dfff',label:'🔵 COOL ZONE'}};
  const s=S[city.level]||S.cool;
  badge.style.background=s.bg;badge.style.border=`1px solid ${s.border}`;badge.style.color=s.color;badge.textContent=s.label;
  document.getElementById('wpAdv').innerHTML=(ADV[city.level]||ADV.cool).map(a=>`<div class="adv">${a}</div>`).join('');
  document.getElementById('wp').style.display='block';
}

/* ══════════════════════════════════════  BUILD SCENE  ══════════════════════════════════════ */
function buildScene(city) {
  const canvas=document.getElementById('c3d');
  const W=canvas.offsetWidth,H=canvas.offsetHeight;
  const P=getProfile(city);

  renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=city.level==='hot'?1.25:1.0;

  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(52,W/H,0.1,1200);
  clock=new THREE.Clock();

  buildNaturalSky(P,city);
  positionCamera();
  buildLighting(city,P);
  buildGround(P,city);
  buildRoads(P);
  buildSidewalks();
  buildLandmarks(P,city);
  buildCityBlocks(P,city);
  buildStreetTrees(P,city);
  buildStreetFurniture();
  buildAmbientEffects(city,P);
  setupOrbitControls();
  animate(city);
}

/* ══  SKY  ══ */
function buildNaturalSky(P,city) {
  scene.background=new THREE.Color(P.sky.horizon);
  scene.fog=new THREE.FogExp2(new THREE.Color(P.sky.horizon),0.006);

  // Gradient sky dome
  const skyGeo=new THREE.SphereGeometry(500,32,16);
  skyGeo.scale(-1,1,1);
  const topC=new THREE.Color(P.sky.top),horC=new THREE.Color(P.sky.horizon);
  const pos=skyGeo.attributes.position;
  const cols=new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){
    const t=Math.max(0,Math.min(1,pos.getY(i)/200));
    const c=new THREE.Color().lerpColors(horC,topC,t);
    cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;
  }
  skyGeo.setAttribute('color',new THREE.BufferAttribute(cols,3));
  scene.add(new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));

  // Sun
  const sunP=new THREE.Vector3(80,200,-120);
  const sunC=city.level==='hot'?0xfffbe8:city.level==='cool'?0xdde8ff:0xfff8ee;
  const sun=new THREE.Mesh(new THREE.SphereGeometry(16,16,16),new THREE.MeshBasicMaterial({color:sunC}));
  sun.position.copy(sunP);scene.add(sun);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(26,16,16),new THREE.MeshBasicMaterial({color:sunC,transparent:true,opacity:.12}));
  halo.position.copy(sunP);scene.add(halo);

  // Clouds
  if(city.level!=='hot') buildClouds(city);
  if(city.temp<5) buildStars();
}

function buildClouds(city) {
  const n=city.level==='cool'?14:8;
  for(let i=0;i<n;i++){
    const cx=(Math.random()-.5)*300,cy=80+Math.random()*80,cz=(Math.random()-.5)*300;
    const cMat=new THREE.MeshStandardMaterial({color:city.level==='cool'?0xc0c0c8:0xfafafa,transparent:true,opacity:city.level==='cool'?.82:.7,roughness:1});
    for(let b=0;b<4+Math.floor(Math.random()*4);b++){
      const r=6+Math.random()*10;
      const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),cMat);
      m.position.set(cx+(Math.random()-.5)*22,cy+(Math.random()-.5)*5,cz+(Math.random()-.5)*12);
      scene.add(m);
    }
  }
}
function buildStars(){const geo=new THREE.BufferGeometry();const pos=new Float32Array(800*3);for(let i=0;i<800;i++){pos[i*3]=(Math.random()-.5)*600;pos[i*3+1]=80+Math.random()*300;pos[i*3+2]=(Math.random()-.5)*600;}geo.setAttribute('position',new THREE.BufferAttribute(pos,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:.6,transparent:true,opacity:.8})));}

/* ══  LIGHTING  ══ */
function buildLighting(city,P) {
  scene.add(new THREE.AmbientLight(city.level==='hot'?0xffe8cc:city.level==='cool'?0xaabbdd:0xddeeff,city.level==='hot'?.9:city.level==='cool'?.55:.75));
  const sun=new THREE.DirectionalLight(city.level==='hot'?0xffeecc:city.level==='cool'?0xccddff:0xfff5e0,city.level==='hot'?3.0:city.level==='cool'?1.4:2.2);
  sun.position.set(80,200,-120);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.near=.5;sun.shadow.camera.far=500;
  sun.shadow.camera.left=sun.shadow.camera.bottom=-120;sun.shadow.camera.right=sun.shadow.camera.top=120;sun.shadow.bias=-.001;
  scene.add(sun);
  const fill=new THREE.DirectionalLight(city.level==='cool'?0x8899cc:0xaaccee,.5);fill.position.set(-40,60,80);scene.add(fill);
  scene.add(new THREE.HemisphereLight(new THREE.Color(P.sky.top),new THREE.Color(0x404040),.4));
}

/* ══  GROUND  ══ */
function buildGround(P,city) {
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:heatTint(P.groundColor,city.temp),roughness:.95}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const blockMat=new THREE.MeshStandardMaterial({color:heatTint(P.roadColor+0x101010,city.temp),roughness:.88});
  for(let r=-3;r<=3;r++)for(let c=-3;c<=3;c++){const bg=new THREE.Mesh(new THREE.BoxGeometry(12,.05,12),blockMat);bg.position.set(r*16,.02,c*16);bg.receiveShadow=true;scene.add(bg);}
}

/* ══  ROADS  ══ */
function buildRoads(P) {
  const asMat=new THREE.MeshStandardMaterial({color:P.roadColor,roughness:.92});
  const mkMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,emissive:0xffffff,emissiveIntensity:.05});
  [[0,0,300,6],[0,0,6,300],[32,0,300,4],[-32,0,300,4],[0,32,4,300],[0,-32,4,300],[64,0,300,3],[-64,0,300,3]].forEach(([x,z,w,d])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.06,d),asMat);m.position.set(x,.03,z);m.receiveShadow=true;scene.add(m);});
  for(let i=-140;i<140;i+=12){const mk=new THREE.Mesh(new THREE.BoxGeometry(.3,.07,5),mkMat);mk.position.set(i,.035,0);scene.add(mk);const mk2=new THREE.Mesh(new THREE.BoxGeometry(5,.07,.3),mkMat);mk2.position.set(0,.035,i);scene.add(mk2);}
  const kM=new THREE.MeshStandardMaterial({color:0xcccccc,roughness:.85});
  [-3.2,3.2].forEach(o=>{const k1=new THREE.Mesh(new THREE.BoxGeometry(300,.2,.4),kM);k1.position.set(0,.1,o);scene.add(k1);const k2=new THREE.Mesh(new THREE.BoxGeometry(.4,.2,300),kM);k2.position.set(o,.1,0);scene.add(k2);});
}

/* ══  SIDEWALKS  ══ */
function buildSidewalks() {
  const pM=new THREE.MeshStandardMaterial({color:0xb8b0a0,roughness:.88});
  [[0,4.5,300,3],[0,-4.5,300,3],[4.5,0,3,300],[-4.5,0,3,300]].forEach(([x,z,w,d])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.08,d),pM);m.position.set(x,.04,z);m.receiveShadow=true;scene.add(m);});
}

/* ══  LANDMARKS  ══ */
function buildLandmarks(P,city) {
  (P.landmarks||[]).forEach((type,i)=>{
    const angle=(i/Math.max(1,(P.landmarks||[]).length))*Math.PI*2+.5;
    const dist=20+i*9;
    buildLandmarkType(type,Math.cos(angle)*dist,Math.sin(angle)*dist,P,city);
  });
}

function mat3(col,rough,metal){return new THREE.MeshStandardMaterial({color:col,roughness:rough,metalness:metal});}

function buildLandmarkType(type,x,z,P,city) {
  const wc=P.wallColors, gc=P.glassColors;
  switch(type) {
    case 'burj_tower':{
      const h=55;
      for(let s=0;s<8;s++){const f=s/8;const tw=5*(1-f*.75);const sh=h/8;const m=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,tw),mat3(gc[s%gc.length],.08,.92));m.position.set(x,s*sh+sh/2,z);m.castShadow=true;scene.add(m);}
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.05,.3,12,8),mat3(0xdddddd,.1,.9));sp.position.set(x,h+6,z);scene.add(sp);break;
    }
    case 'sail_tower':{
      const h=42;for(let s=0;s<10;s++){const f=s/10;const sh=h/10;const m=new THREE.Mesh(new THREE.BoxGeometry(6*(1-f*.2),sh,2+f*4),mat3(gc[0],.05,.95));m.position.set(x,s*sh+sh/2,z);m.castShadow=true;scene.add(m);}break;
    }
    case 'kingdom_tower':{
      const h=48;for(let s=0;s<10;s++){const f=s/10;const tw=5-f*3.5;const sh=h/10;const m=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,tw*.4),mat3(gc[0],.08,.92));m.position.set(x,s*sh+sh/2,z);m.castShadow=true;scene.add(m);}break;
    }
    case 'empire_skyscraper':{
      const steps=[[8,8,18],[6,6,8],[4,4,6],[2.5,2.5,4],[1.2,1.2,3]];let y=0;
      steps.forEach(([tw,td,sh])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,td),mat3(heatTint(wc[0],city.temp),.6,.3));m.position.set(x,y+sh/2,z);m.castShadow=true;scene.add(m);y+=sh;});
      const ant=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,8,6),mat3(0x999999,.4,.8));ant.position.set(x,y+4,z);scene.add(ant);break;
    }
    case 'cn_tower_style':{
      const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.4,1.2,45,12),mat3(heatTint(wc[0],city.temp),.6,.1));shaft.position.set(x,22.5,z);shaft.castShadow=true;scene.add(shaft);
      const pod=new THREE.Mesh(new THREE.CylinderGeometry(3,3,2,16),mat3(0x888888,.6,.4));pod.position.set(x,40,z);scene.add(pod);
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.05,.3,14,6),mat3(0xaaaaaa,.1,.9));sp.position.set(x,50,z);scene.add(sp);break;
    }
    case 'onion_dome':{
      const body=new THREE.Mesh(new THREE.BoxGeometry(8,14,8),mat3(heatTint(0xe8e0d0,city.temp),.8,.0));body.position.set(x,7,z);body.castShadow=true;scene.add(body);
      const twr=new THREE.Mesh(new THREE.BoxGeometry(3,20,3),mat3(heatTint(0xe0d8c8,city.temp),.8,.0));twr.position.set(x+5,10,z);twr.castShadow=true;scene.add(twr);
      const dome=new THREE.Mesh(new THREE.SphereGeometry(2.5,16,12),mat3(0xd4aa00,.3,.7));dome.scale.set(1,1.6,1);dome.position.set(x+5,22,z);scene.add(dome);
      const cross=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,4,4),mat3(0xd4aa00,.2,.8));cross.position.set(x+5,26,z);scene.add(cross);break;
    }
    case 'soviet_block':{
      const h=18;const body=new THREE.Mesh(new THREE.BoxGeometry(20,h,8),mat3(heatTint(0xa0a0a0,city.temp),.85,.0));body.position.set(x,h/2,z);body.castShadow=true;scene.add(body);break;
    }
    case 'stalin_spire':{
      const tiers=[[10,8,12],[7,6,8],[4,4,6],[2,2,4]];let yy=0;
      tiers.forEach(([tw,td,sh])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,td),mat3(heatTint(0xb0a890,city.temp),.7,.0));m.position.set(x,yy+sh/2,z);m.castShadow=true;scene.add(m);yy+=sh;});
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.08,.4,10,8),mat3(0xd4aa00,.2,.6));sp.position.set(x,yy+5,z);scene.add(sp);break;
    }
    case 'eiffel_style':{
      const eMat=mat3(0x886644,.7,.3);
      [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([lx,lz])=>{const leg=new THREE.Mesh(new THREE.CylinderGeometry(.2,.6,16,6),eMat);leg.position.set(x+lx,8,z+lz);leg.rotation.z=lx<0?.18:-.18;leg.castShadow=true;scene.add(leg);});
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.4,2,18,8),eMat);body.position.set(x,22,z);scene.add(body);
      const top=new THREE.Mesh(new THREE.CylinderGeometry(.06,.3,8,8),eMat);top.position.set(x,34,z);scene.add(top);break;
    }
    case 'pagoda':{
      const floors=[5,4,3,2.2,1.4];let py=0;
      floors.forEach(tw=>{const sh=2.5;const body=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,tw),mat3(heatTint(0xc0380a,city.temp),.7,.0));body.position.set(x,py+sh/2,z);body.castShadow=true;scene.add(body);const eave=new THREE.Mesh(new THREE.BoxGeometry(tw+1.5,.25,tw+1.5),mat3(0x601800,.7,.0));eave.position.set(x,py+sh+.12,z);scene.add(eave);py+=sh+.3;});break;
    }
    case 'temple_dome':{
      const base=new THREE.Mesh(new THREE.BoxGeometry(10,4,10),mat3(heatTint(0xf0d890,city.temp),.8,.0));base.position.set(x,2,z);base.castShadow=true;scene.add(base);
      const shik=new THREE.Mesh(new THREE.CylinderGeometry(.1,3,14,12),mat3(heatTint(0xe8cc70,city.temp),.75,.0));shik.position.set(x,11,z);shik.castShadow=true;scene.add(shik);
      const fin=new THREE.Mesh(new THREE.SphereGeometry(1,8,8),mat3(0xd4aa00,.2,.7));fin.position.set(x,18.5,z);scene.add(fin);break;
    }
    case 'temple_spire':{
      const base=new THREE.Mesh(new THREE.BoxGeometry(8,3,8),mat3(heatTint(0xd4aa00,city.temp),.6,.3));base.position.set(x,1.5,z);base.castShadow=true;scene.add(base);
      for(let t=0;t<5;t++){const tw=5-t*.8;const sh=3;const tier=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,tw),mat3(heatTint(0xc89800,city.temp),.5,.4));tier.position.set(x,3+t*sh+sh/2,z);tier.castShadow=true;scene.add(tier);}
      const tip=new THREE.Mesh(new THREE.CylinderGeometry(.05,.5,8,8),mat3(0xffcc00,.1,.8));tip.position.set(x,3+5*3+4,z);scene.add(tip);break;
    }
    case 'minaret':{
      const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.2,22,12),mat3(heatTint(0xf0e8d0,city.temp),.75,.0));shaft.position.set(x,11,z);shaft.castShadow=true;scene.add(shaft);
      const balc=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.4,16),mat3(heatTint(0xe8d8b0,city.temp),.7,.0));balc.position.set(x,20,z);scene.add(balc);
      const cap=new THREE.Mesh(new THREE.SphereGeometry(1.2,12,8),mat3(0x448855,.4,.4));cap.scale.y=1.4;cap.position.set(x,23,z);scene.add(cap);break;
    }
    case 'glass_shard':{
      const h=38;for(let s=0;s<10;s++){const f=s/10;const tw=5-f*3.8;const sh=h/10;const m=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,tw*.6),mat3(gc[0],.05,.95));m.position.set(x+f*2,s*sh+sh/2,z);m.castShadow=true;scene.add(m);}break;
    }
    case 'victorian_arch':{
      const vM=mat3(heatTint(0xc0b090,city.temp),.8,.0);
      [-3,3].forEach(ox=>{const p=new THREE.Mesh(new THREE.BoxGeometry(2,10,2),vM);p.position.set(x+ox,5,z);p.castShadow=true;scene.add(p);});
      const top=new THREE.Mesh(new THREE.BoxGeometry(8,2,2),vM);top.position.set(x,10,z);scene.add(top);
      const body=new THREE.Mesh(new THREE.BoxGeometry(14,18,8),mat3(heatTint(0xd0c0a0,city.temp),.8,.0));body.position.set(x,9,z-4);body.castShadow=true;scene.add(body);break;
    }
    case 'haussmann_block':{
      const h=16;const body=new THREE.Mesh(new THREE.BoxGeometry(14,h,10),mat3(heatTint(0xece0cc,city.temp),.75,.0));body.position.set(x,h/2,z);body.castShadow=true;scene.add(body);
      const roof=new THREE.Mesh(new THREE.BoxGeometry(14,4,10),mat3(0x5a5a6a,.7,.0));roof.position.set(x,h+2,z);scene.add(roof);break;
    }
    case 'bauhaus_block':{
      const h=16;const body=new THREE.Mesh(new THREE.BoxGeometry(16,h,10),mat3(heatTint(0xc8ccc8,city.temp),.6,.1));body.position.set(x,h/2,z);body.castShadow=true;scene.add(body);
      const band=new THREE.Mesh(new THREE.BoxGeometry(16.1,2,.2),mat3(gc[0],.05,.9));band.position.set(x,h*.6,z+5.1);scene.add(band);break;
    }
    case 'church_spire':{
      const body=new THREE.Mesh(new THREE.BoxGeometry(10,12,16),mat3(heatTint(0xf0f0f0,city.temp),.8,.0));body.position.set(x,6,z);body.castShadow=true;scene.add(body);
      const spire=new THREE.Mesh(new THREE.CylinderGeometry(.05,1.5,20,8),mat3(0x333333,.7,.0));spire.position.set(x,22,z-4);spire.castShadow=true;scene.add(spire);break;
    }
    case 'colorful_house':{
      const hc=[0xff6644,0x4488ff,0xffcc44,0x44cc88,0xee4488];
      for(let hi=0;hi<5;hi++){const h=5+Math.random()*3;const hm=new THREE.Mesh(new THREE.BoxGeometry(4,h,5),mat3(hc[hi],.75,.0));hm.position.set(x+hi*5-10,h/2,z);hm.castShadow=true;scene.add(hm);const roof=new THREE.Mesh(new THREE.CylinderGeometry(.01,3.2,3,4),mat3(0x882222,.8,.0));roof.position.set(x+hi*5-10,h+1.5,z);roof.rotation.y=Math.PI/4;scene.add(roof);}break;
    }
    case 'water_tower':{
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,5,6),mat3(0x885533,.9,.0));pole.position.set(x,2.5,z);scene.add(pole);
      const tank=new THREE.Mesh(new THREE.CylinderGeometry(2,2,3,12),mat3(0x7a5030,.85,.0));tank.position.set(x,6.5,z);scene.add(tank);
      const roof=new THREE.Mesh(new THREE.CylinderGeometry(.1,2.2,2,12),mat3(0x663322,.85,.0));roof.position.set(x,8.5,z);scene.add(roof);break;
    }
    case 'tokyo_tower':{
      const tMat=mat3(0xee4411,.6,.4);
      [[-2,-2],[2,-2],[-2,2],[2,2]].forEach(([lx,lz])=>{const leg=new THREE.Mesh(new THREE.CylinderGeometry(.15,.5,20,6),tMat);leg.position.set(x+lx,10,z+lz);leg.rotation.z=lx<0?.1:-.1;leg.castShadow=true;scene.add(leg);});
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.3,1.5,22,8),tMat);body.position.set(x,24,z);scene.add(body);
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.04,.2,10,8),mat3(0xffffff,.1,.9));sp.position.set(x,38,z);scene.add(sp);break;
    }
    case 'colonial_arch':{
      const cM=mat3(heatTint(0xd4c0a0,city.temp),.8,.0);
      const body=new THREE.Mesh(new THREE.BoxGeometry(12,15,8),cM);body.position.set(x,7.5,z);body.castShadow=true;scene.add(body);
      const dome=new THREE.Mesh(new THREE.SphereGeometry(3.5,12,8),cM);dome.scale.y=.7;dome.position.set(x,16,z);scene.add(dome);break;
    }
    default:{
      const h=16+Math.random()*20;const m=new THREE.Mesh(new THREE.BoxGeometry(6,h,6),mat3(heatTint(wc[0],city.temp),.6,.2));m.position.set(x,h/2,z);m.castShadow=true;scene.add(m);
    }
  }
}

/* ══  CITY BLOCK BUILDINGS  ══ */
function buildCityBlocks(P,city) {
  const [lowR,midR]=P.heightMix||[.35,.4];
  for(let r=0;r<10;r++)for(let c=0;c<10;c++){
    if(Math.random()<.18) continue;
    const cx=r*14-63+(Math.random()-.5)*3;
    const cz=c*14-63+(Math.random()-.5)*3;
    if(Math.abs(cx)<14&&Math.abs(cz)<14) continue;
    const rnd=Math.random();
    buildCityBuilding(cx,cz,rnd<lowR?'low':rnd<lowR+midR?'mid':'tall',P,city);
  }
}

function buildCityBuilding(x,z,tier,P,city) {
  const wc=P.wallColors,gc=P.glassColors,style=P.style;
  const hmap={low:3+Math.random()*5,mid:8+Math.random()*12,tall:18+Math.random()*22};
  const h=hmap[tier];
  const bw=4+Math.random()*5,bd=4+Math.random()*5;
  const wallCol=heatTint(wc[Math.floor(Math.random()*wc.length)],city.temp);
  const glassCol=gc[Math.floor(Math.random()*gc.length)];
  const isGlass=(style.includes('modern')||style.includes('metro'))&&tier==='tall'&&Math.random()<.55;
  const bMat=isGlass?mat3(glassCol,.08,.92):mat3(wallCol,.72,.05);
  const body=new THREE.Mesh(new THREE.BoxGeometry(bw,h,bd),bMat);
  body.position.set(x,h/2,z);body.castShadow=body.receiveShadow=true;scene.add(body);
  animBuildings.push({mesh:body,phase:Math.random()*Math.PI*2});

  // Style details
  if(style==='north_american_metro'&&tier==='tall') addStepbacks(x,z,h,bw,bd,wallCol,city);
  if(style==='european_classic'&&tier!=='tall') addMansardRoof(x,z,h,bw,bd);
  if((style==='gulf_modern'||style==='arabic_historic')&&tier==='low') addFlatParapet(x,z,h,bw,bd,wallCol);
  if(style==='nordic'&&tier==='low') addPitchedRoof(x,z,h,bw,bd);

  addRealisticWindows(x,z,h,bw,bd,glassCol,tier);
  if(tier==='tall'){if(Math.random()<.4) addRooftopAntenna(x,z,h);if(Math.random()<.3) addRooftopACUnits(x,z,h,bw,bd);}
}

function addStepbacks(x,z,h,bw,bd,col,city) {
  if(h<20)return;const mat=mat3(heatTint(col,city.temp),.65,.1);
  [[bw*.7,bd*.7,h*.3],[bw*.5,bd*.5,h*.15]].forEach(([tw,td,sh],i)=>{const yBase=h+i*sh*.5;const m=new THREE.Mesh(new THREE.BoxGeometry(tw,sh,td),mat);m.position.set(x,yBase+sh/2,z);m.castShadow=true;scene.add(m);});
}
function addMansardRoof(x,z,h,bw,bd){const r=new THREE.Mesh(new THREE.BoxGeometry(bw,2.5,bd),mat3(0x555566,.7,.0));r.position.set(x,h+1.25,z);scene.add(r);}
function addFlatParapet(x,z,h,bw,bd,col){const p=new THREE.Mesh(new THREE.BoxGeometry(bw+.4,.6,bd+.4),mat3(col,.8,.0));p.position.set(x,h+.3,z);scene.add(p);}
function addPitchedRoof(x,z,h,bw,bd){const r=new THREE.Mesh(new THREE.CylinderGeometry(.1,bw/1.8,3,4),mat3(0x882222,.8,.0));r.position.set(x,h+1.5,z);r.rotation.y=Math.PI/4;scene.add(r);}

function addRealisticWindows(x,z,h,bw,bd,glassCol,tier) {
  const wH=tier==='tall'?1.0:.9,wW=tier==='tall'?.7:.65,flH=tier==='tall'?2.4:2.2;
  const floors=Math.floor(h/flH);
  const isLit=Math.random()<.6;
  const wMat=mat3(glassCol,.08,.85);wMat.emissive=new THREE.Color(glassCol);wMat.emissiveIntensity=isLit?.55:.15;
  const wGeo=new THREE.PlaneGeometry(wW,wH);
  const fCols=Math.floor(bw/1.4);
  for(let fl=0;fl<floors;fl++)for(let wc=0;wc<fCols;wc++){if(Math.random()<.15)continue;const win=new THREE.Mesh(wGeo,wMat);win.position.set(x-bw/2+1+wc*(bw-1.5)/Math.max(1,fCols-1),fl*flH+flH/2+.5,z+bd/2+.02);scene.add(win);}
  const sCols=Math.floor(bd/1.4);
  const wGeo2=new THREE.PlaneGeometry(wW,wH);
  for(let fl=0;fl<floors;fl++)for(let wc=0;wc<sCols;wc++){if(Math.random()<.15)continue;const win=new THREE.Mesh(wGeo2,wMat);win.rotation.y=Math.PI/2;win.position.set(x+bw/2+.02,fl*flH+flH/2+.5,z-bd/2+1+wc*(bd-1.5)/Math.max(1,sCols-1));scene.add(win);}
}
function addRooftopAntenna(x,z,h){const ant=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,5,6),mat3(0x888888,.4,.8));ant.position.set(x+(Math.random()-.5),h+2.5,z+(Math.random()-.5));scene.add(ant);const bMat=mat3(0xff2200,.2,.8);bMat.emissive=new THREE.Color(0xff2200);bMat.emissiveIntensity=1;const bea=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),bMat);bea.position.set(x+(Math.random()-.5),h+5.2,z+(Math.random()-.5));scene.add(bea);animBuildings.push({mesh:bea,isBeacon:true,phase:Math.random()*Math.PI*2});}
function addRooftopACUnits(x,z,h,bw,bd){const mat=mat3(0x888888,.7,.2);for(let i=0;i<3;i++){const ac=new THREE.Mesh(new THREE.BoxGeometry(1.2,.7,1.8),mat);ac.position.set(x+(Math.random()-.5)*(bw-2),h+.35,z+(Math.random()-.5)*(bd-2));scene.add(ac);}}

/* ══  TREES  ══ */
function buildStreetTrees(P,city) {
  const t=P.treeType||'deciduous';
  for(let i=-120;i<120;i+=10){if(Math.abs(i)<6)continue;addCityTree(i,5.5,t,city);addCityTree(i,-5.5,t,city);addCityTree(5.5,i,t,city);addCityTree(-5.5,i,t,city);}
  for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,d=40+Math.random()*55;addCityTree(Math.cos(a)*d,Math.sin(a)*d,t,city);}
}
function addCityTree(x,z,type,city){switch(type){case 'palm':addPalmTree(x,z,city);break;case 'banyan':addBanyanTree(x,z);break;case 'cherry':addCherryTree(x,z);break;case 'pine':addPineTree(x,z,city);break;case 'tropical':addTropicalTree(x,z);break;default:addDeciduousTree(x,z,city);}}

function addPalmTree(x,z,city){const tH=4+Math.random()*4;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.15,.25,tH,8),mat3(0xa07840,.9,.0));trunk.position.set(x,tH/2,z);trunk.rotation.z=(Math.random()-.5)*.15;trunk.castShadow=true;scene.add(trunk);const fM=new THREE.MeshStandardMaterial({color:0x3a7a20,roughness:.8,side:THREE.DoubleSide});for(let f=0;f<7;f++){const frond=new THREE.Mesh(new THREE.PlaneGeometry(.4,2.5),fM);const a=(f/7)*Math.PI*2;frond.position.set(x+Math.cos(a)*1.2,tH-.2,z+Math.sin(a)*1.2);frond.rotation.set(-.4,a,0);scene.add(frond);}animBuildings.push({mesh:trunk,isTree:true,phase:Math.random()*Math.PI*2,isPalm:true});}
function addBanyanTree(x,z){const tH=2.5+Math.random()*2;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,tH,8),mat3(0x5a4020,.9,.0));trunk.position.set(x,tH/2,z);trunk.castShadow=true;scene.add(trunk);const lR=2.5+Math.random()*1.5;const leaf=new THREE.Mesh(new THREE.SphereGeometry(lR,10,7),mat3(0x2a6a18,.8,.0));leaf.scale.set(1.4,.7,1.4);leaf.position.set(x,tH+lR*.5,z);leaf.castShadow=true;scene.add(leaf);animBuildings.push({mesh:leaf,isTree:true,phase:Math.random()*Math.PI*2});}
function addCherryTree(x,z){const tH=2.2+Math.random()*1.5;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,tH,8),mat3(0x5a3820,.9,.0));trunk.position.set(x,tH/2,z);trunk.castShadow=true;scene.add(trunk);const lR=1.6+Math.random();const leaf=new THREE.Mesh(new THREE.SphereGeometry(lR,10,7),mat3(Math.random()<.5?0xffb0c8:0x80cc80,.75,.0));leaf.position.set(x,tH+lR*.7,z);leaf.castShadow=true;scene.add(leaf);animBuildings.push({mesh:leaf,isTree:true,phase:Math.random()*Math.PI*2});}
function addPineTree(x,z,city){const tH=.8;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,tH,8),mat3(0x5a3820,.9,.0));trunk.position.set(x,tH/2,z);scene.add(trunk);for(let t=0;t<3+Math.floor(Math.random()*2);t++){const r=(4-t)*.9;const tier=new THREE.Mesh(new THREE.CylinderGeometry(.05,r,1.4,8),mat3(city.level==='cool'?0x1a5a30:0x2a7040,.85,.0));tier.position.set(x,tH+t*1.4*.7+.7,z);tier.castShadow=true;scene.add(tier);}}
function addTropicalTree(x,z){const tH=3+Math.random()*3;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,tH,8),mat3(0x6a4822,.9,.0));trunk.position.set(x,tH/2,z);trunk.castShadow=true;scene.add(trunk);const lR=2+Math.random();const leaf=new THREE.Mesh(new THREE.SphereGeometry(lR,10,7),mat3(0x207820,.8,.0));leaf.scale.set(1.2,.8,1.2);leaf.position.set(x,tH+lR*.6,z);leaf.castShadow=true;scene.add(leaf);animBuildings.push({mesh:leaf,isTree:true,phase:Math.random()*Math.PI*2});}
function addDeciduousTree(x,z,city){const tH=1.8+Math.random()*1.5;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,tH,8),mat3(0x5a3820,.9,.0));trunk.position.set(x,tH/2,z);trunk.castShadow=true;scene.add(trunk);const lR=1.8+Math.random()*1.2;const leaf=new THREE.Mesh(new THREE.SphereGeometry(lR,10,7),mat3(city.level==='cool'?0x3a7040:0x2d7a30,.8,.0));leaf.position.set(x,tH+lR*.7,z);leaf.castShadow=true;scene.add(leaf);animBuildings.push({mesh:leaf,isTree:true,phase:Math.random()*Math.PI*2});}

/* ══  STREET FURNITURE  ══ */
function buildStreetFurniture(){
  const lM=mat3(0x888888,.7,.6),ltM=mat3(0xffffaa,.2,.0);ltM.emissive=new THREE.Color(0xffffaa);ltM.emissiveIntensity=.8;
  for(let i=-80;i<80;i+=16)[[i,7.5],[i,-7.5],[7.5,i],[-7.5,i]].forEach(([lx,lz])=>{const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,4.5,6),lM);pole.position.set(lx,2.25,lz);scene.add(pole);const head=new THREE.Mesh(new THREE.BoxGeometry(.5,.2,.8),lM);head.position.set(lx,4.6,lz);scene.add(head);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.15,8,8),ltM);bulb.position.set(lx,4.5,lz);scene.add(bulb);});
  const bM=mat3(0x8b6040,.85,.0);
  for(let i=-50;i<50;i+=18){const b=new THREE.Mesh(new THREE.BoxGeometry(2,.15,.6),bM);b.position.set(i+6,.15,6.5);scene.add(b);}
}

/* ══  AMBIENT EFFECTS  ══ */
function buildAmbientEffects(city,P) {
  if(city.level==='hot'){
    const count=300,geo=new THREE.BufferGeometry(),pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*120;pos[i*3+1]=Math.random()*8;pos[i*3+2]=(Math.random()-.5)*120;particleVelocities.push({x:(Math.random()-.5)*.015,y:.005+Math.random()*.015,z:(Math.random()-.5)*.015});}
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xd4a070,size:.35,transparent:true,opacity:.35}));scene.add(particles);
  }
  if(city.temp<4){
    const count=250,geo=new THREE.BufferGeometry(),pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*100;pos[i*3+1]=Math.random()*50;pos[i*3+2]=(Math.random()-.5)*100;particleVelocities.push({x:(Math.random()-.5)*.01,y:-.02-Math.random()*.03,z:(Math.random()-.5)*.01});}
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xeef4ff,size:.3,transparent:true,opacity:.7}));scene.add(particles);
  }
  if(city.hum>70&&city.temp>5&&city.temp<25){
    const count=200,geo=new THREE.BufferGeometry(),pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*100;pos[i*3+1]=Math.random()*40;pos[i*3+2]=(Math.random()-.5)*100;particleVelocities.push({x:.005,y:-.04-Math.random()*.02,z:.005});}
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xaaccee,size:.15,transparent:true,opacity:.45}));scene.add(particles);
  }
  if(P.style==='nordic'||P.style==='east_asian_modern'){
    const water=new THREE.Mesh(new THREE.PlaneGeometry(60,60,20,20),new THREE.MeshStandardMaterial({color:0x2255aa,roughness:.08,metalness:.85,transparent:true,opacity:.85}));
    water.rotation.x=-Math.PI/2;water.position.set(70,.04,10);scene.add(water);waterMeshes.push(water);
  }
}

/* ══  CAMERA  ══ */
function positionCamera(){const x=radius*Math.sin(phi)*Math.sin(theta);const y=radius*Math.cos(phi);const z=radius*Math.sin(phi)*Math.cos(theta);camera.position.set(x+target.x,y+target.y,z+target.z);camera.lookAt(target);}

function setupOrbitControls(){
  const c3d=document.getElementById('c3d');
  c3d.addEventListener('mousedown',e=>{isDrag=true;isRight=e.button===2;prev={x:e.clientX,y:e.clientY};});
  window.addEventListener('mouseup',()=>{isDrag=false;});
  window.addEventListener('mousemove',e=>{if(!isDrag)return;const dx=e.clientX-prev.x,dy=e.clientY-prev.y;prev={x:e.clientX,y:e.clientY};if(isRight){const right=new THREE.Vector3();camera.getWorldDirection(right);right.cross(camera.up).normalize().multiplyScalar(-dx*.05);const up=new THREE.Vector3(0,1,0).multiplyScalar(dy*.05);target.add(right).add(up);}else{theta-=dx*.005;phi=Math.max(.1,Math.min(Math.PI-.1,phi+dy*.005));}positionCamera();});
  c3d.addEventListener('wheel',e=>{radius=Math.max(12,Math.min(220,radius+e.deltaY*.05));positionCamera();});
  c3d.addEventListener('contextmenu',e=>e.preventDefault());
}

/* ══  ANIMATE  ══ */
function animate(city){
  animId=requestAnimationFrame(()=>animate(city));
  const t=clock.getElapsedTime();
  if(particles){const pos=particles.geometry.attributes.position.array;for(let i=0;i<particleVelocities.length;i++){pos[i*3]+=particleVelocities[i].x;pos[i*3+1]+=particleVelocities[i].y;pos[i*3+2]+=particleVelocities[i].z;if(city.temp<4){if(pos[i*3+1]<0)pos[i*3+1]=50;}else{if(pos[i*3+1]>60)pos[i*3+1]=0;}}particles.geometry.attributes.position.needsUpdate=true;}
  waterMeshes.forEach(w=>{w.position.y=.04+Math.sin(t*.8)*.06;});
  animBuildings.forEach(obj=>{if(obj.isTree){obj.mesh.rotation.z=Math.sin(t*1.1+obj.phase)*.025;if(obj.isPalm)obj.mesh.rotation.x=Math.sin(t*.9+obj.phase)*.02;return;}if(obj.isBeacon){obj.mesh.material.emissiveIntensity=.4+.6*Math.sin(t*2.5+obj.phase);return;}});
  renderer.render(scene,camera);
}

/* ══  GO BACK  ══ */
function goBack(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer){renderer.dispose();renderer.forceContextLoss();}
  waterMeshes=[];animBuildings=[];particleVelocities=[];
  document.getElementById('scene3d').style.display='none';
  document.getElementById('mapWrap').style.display='block';
  document.getElementById('backBtn').style.display='none';
  document.getElementById('wp').style.display='none';
  document.getElementById('inst').style.display='block';
  document.getElementById('ctrl3d').style.display='none';
  document.getElementById('zoneHud').style.display='none';
}

window.addEventListener('resize',()=>{if(!renderer)return;const c=document.getElementById('c3d');const W=c.offsetWidth,H=c.offsetHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();});