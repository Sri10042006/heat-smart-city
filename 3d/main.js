import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

camera.position.set(0,50,80);
camera.lookAt(0,0,0);

const groundGeometry = new THREE.PlaneGeometry(200,200);
const material = new THREE.MeshStandardMaterial({
color:color
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);

ground.rotation.x = -Math.PI/2;

scene.add(ground);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(20,50,10);
scene.add(light);

function createBuilding(x,z,height){

const geometry = new THREE.BoxGeometry(4,height,4);

const temperature = Math.random()*15 + 30;

let color;

if(temperature < 35){
color = 0x00ff00;
}
else if(temperature < 40){
color = 0xffff00;
}
else{
color = 0xff0000;
}

const material = new THREE.MeshStandardMaterial({color:color});

const building = new THREE.Mesh(geometry,material);

building.position.set(x,height/2,z);

building.userData = {
heat: temperature.toFixed(1),
reason: "Dense concrete buildings",
solution: "Add trees and reflective roofs"
};

scene.add(building);

}
for(let x=-40; x<=40; x+=10){

for(let z=-40; z<=40; z+=10){

const height = Math.random()*20 + 5;

createBuilding(x,z,height);

}

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



renderer.render(scene, camera);
}

animate();