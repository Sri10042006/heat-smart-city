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
    createBuilding(i, j, height, 0xff0000);
  }
}


function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.002;
  renderer.render(scene, camera);
}

animate();
