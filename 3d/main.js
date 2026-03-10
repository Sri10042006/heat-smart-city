import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);
camera.position.set(10,10,10);
camera.lookAt(0,0,0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);


const groundGeometry = new THREE.PlaneGeometry(40,40);

const groundMaterial = new THREE.MeshStandardMaterial({
color:0xdddddd
});

const ground = new THREE.Mesh(
groundGeometry,
groundMaterial
);

ground.rotation.x = -Math.PI/2;

scene.add(ground);

function createBuilding(x,z,height){

const geometry = new THREE.BoxGeometry(2,height,2);

const colors = [0x888888, 0xa0a0a0, 0x777777, 0x999999];

const material = new THREE.MeshStandardMaterial({
color: colors[Math.floor(Math.random() * colors.length)]
});


const building = new THREE.Mesh(geometry,material);

building.position.set(x,height/2,z);

scene.add(building);


}
for (let x = -40; x <= 40; x += 10) {
    for (let z = -40; z <= 40; z += 10) {

        const height = Math.random() * 12 + 4;

        createBuilding(x, z, height);

    }
}
createBuilding(0,0,6);
createBuilding(5,0,8);
createBuilding(-5,0,10);
createBuilding(0,5,7);
createBuilding(0,-5,9);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(10,20,10);
scene.add(light);




function animate(){
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}
animate();