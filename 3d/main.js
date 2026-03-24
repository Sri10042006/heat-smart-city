import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
document.body.appendChild(renderer.domElement);

camera.position.set(0,50,80);
camera.lookAt(0,0,0);

const groundGeometry = new THREE.PlaneGeometry(200,200);
const groundMaterial = new THREE.MeshStandardMaterial({
color: 0xcccccc
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

ground.rotation.x = -Math.PI/2;

scene.add(ground);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(20,50,10);
scene.add(light);

function createBuilding(x, z, height) {

const geometry = new THREE.BoxGeometry(4, height, 4);

const temperature = Math.random() * 15 + 30;

let buildingColor;

if (temperature < 35) {
    buildingColor = 0x00ff00;
}
else if (temperature < 40) {
    buildingColor = 0xffff00;
}
else {
    buildingColor = 0xff0000;
}

const material = new THREE.MeshStandardMaterial({
    color: buildingColor
});

const building = new THREE.Mesh(geometry, material);

building.position.set(x, height / 2, z);

building.userData = {
    heat: temperature.toFixed(1),
    reason: "Dense concrete buildings",
    solution: "Plant trees and reflective roofs"
};

scene.add(building);

}



function createRoad(x, z, width, depth){

const roadGeometry = new THREE.BoxGeometry(width, 0.1, depth);

const roadMaterial = new THREE.MeshStandardMaterial({
color: 0x333333
});

const road = new THREE.Mesh(roadGeometry, roadMaterial);

road.position.set(x, 0.05, z);

scene.add(road);

}

function createTree(x,z){

const trunkGeometry = new THREE.CylinderGeometry(0.2,0.2,2);
const trunkMaterial = new THREE.MeshStandardMaterial({color:0x8B4513});
const trunk = new THREE.Mesh(trunkGeometry,trunkMaterial);

trunk.position.set(x,1,z);

const leafGeometry = new THREE.SphereGeometry(1.2);
const leafMaterial = new THREE.MeshStandardMaterial({color:0x228B22});
const leaves = new THREE.Mesh(leafGeometry,leafMaterial);

leaves.position.set(x,2.5,z);

scene.add(trunk);
scene.add(leaves);

}

for(let x=-40; x<=40; x+=10){

for(let z=-40; z<=40; z+=10){

const height = Math.random()*20 + 5;

createBuilding(x,z,height);

}

}


for(let i=-50; i<=50; i+=10){

createRoad(i,0,2,100);

createRoad(0,i,100,2);

}
for(let i=-40; i<=40; i+=20){

createTree(i,15);

createTree(i,-15);

createTree(15,i);

createTree(-15,i);

}
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click",(event)=>{

mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

raycaster.setFromCamera(mouse,camera);

const intersects = raycaster.intersectObjects(scene.children);

if(intersects.length > 0){

const obj = intersects[0].object;

if(obj.userData.heat){

alert(
"Heat Level: "+obj.userData.heat+" °C\n"+
"Reason: "+obj.userData.reason+"\n"+
"Solution: "+obj.userData.solution
);

}

}

});

function animate(){

requestAnimationFrame(animate);

controls.update();

renderer.render(scene,camera);

}