import * as THREE from 'three';

// Инициализация игры "7 Days to Raft[span_1](start_span)"[span_1](end_span)
const container = document.createElement('div');
document.body.appendChild(container);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// UI для таймера вулкана, статов и выживания[span_2](start_span)[span_2](end_span)
const ui = document.createElement('div');
ui.style.position = 'absolute';
ui.style.top = '10px';
ui.style.left = '10px';
ui.style.color = 'white';
ui.style.fontFamily = 'sans-serif';
ui.style.fontSize = '14px';
ui.style.textShadow = '1px 1px 2px black';
ui.style.background = 'rgba(0, 0, 0, 0.4)';
ui.style.padding = '10px';
ui.style.borderRadius = '8px';
ui.innerHTML = '<h3>7 Days to Raft</h3><p>День: 1 / 7 (Вулкан спокоен)</p><p>Голод: 100 | Жажда: 100 | Здоровье: 100</p>';
document.body.appendChild(ui);

// Сцена Three.js[span_3](start_span)[span_3](end_span)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Свет
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Процедурный остров[span_4](start_span)[span_4](end_span)
const islandGeo = new THREE.CylinderGeometry(5, 6, 1.2, 32);
const islandMat = new THREE.MeshStandardMaterial({ color: 0x557a46, roughness: 0.8 });
const island = new THREE.Mesh(islandGeo, islandMat);
island.position.y = -0.6;
scene.add(island);

// Вулкан в центре острова[span_5](start_span)[span_5](end_span)
const volcanoGeo = new THREE.ConeGeometry(2, 2.5, 16);
const volcanoMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
const volcano = new THREE.Mesh(volcanoGeo, volcanoMat);
volcano.position.set(0, 0.6, 0);
scene.add(volcano);

// Океан вокруг[span_6](start_span)[span_6](end_span)
const waterGeo = new THREE.PlaneGeometry(150, 150);
const waterMat = new THREE.MeshStandardMaterial({ color: 0x1ca3ec, roughness: 0.1 });
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.2;
scene.add(water);

// Анимация вращения камеры/вулкана
function animate() {
  requestAnimationFrame(animate);
  volcano.rotation.y += 0.003;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
