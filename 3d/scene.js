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
    const height = Math.random() * 8 + 2;

    // Heat-based color logic
    let color;

    if (height > 8) {
      color = 0xff0000; // very hot - red
    } else if (height > 5) {
      color = 0xff6600; // medium hot - orange
    } else {
      color = 0xffff00; // cooler - yellow
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


