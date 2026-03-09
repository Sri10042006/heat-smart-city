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

const renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff,1);
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
light.position.set(10,20,10);

scene.add(light);



function animate(){

requestAnimationFrame(animate);

renderer.render(scene,camera);

}

animate();