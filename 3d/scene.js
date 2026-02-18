// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 20;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;



controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN
};
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};

controls.target.set(0, 0, 0);
controls.update();


// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

function createBuilding(x, z, height, color) {
  const geometry = new THREE.BoxGeometry(2, height, 2);
  const material = new THREE.MeshPhongMaterial({ color: color });
  const building = new THREE.Mesh(geometry, material);
  
  building.position.set(x, height / 2, z);
  scene.add(building);
}

// Create grid of buildings
for (let i = -5; i <= 5; i += 3) {
  for (let j = -5; j <= 5; j += 3) {

    const temperature = Math.random() * 15 + 25; 
    // Simulated temperature: 25°C to 40°C

    const height = temperature - 20; 
    // Taller building = hotter area

    let color;

    if (temperature > 37) {
      color = 0xff0000; // very hot
    } else if (temperature > 32) {
      color = 0xff6600; // medium
    } else {
      color = 0xffff00; // mild
    }

    createBuilding(i, j, height, color);
  }
}




function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);


