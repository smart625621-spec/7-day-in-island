import * as THREE from 'three';

let stats = { health: 100, hunger: 100, thirst: 100, wood: 0, stone: 0, day: 1 };

const container = document.createElement('div');
document.body.appendChild(container);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// Тактический HUD
const hud = document.createElement('div');
hud.style.position = 'absolute';
hud.style.top = '0'; hud.style.left = '0'; hud.style.width = '100%'; hud.style.height = '100%';
hud.style.pointerEvents = 'none'; hud.style.fontFamily = 'Courier New, monospace';
hud.innerHTML = `
  <div style="position: absolute; top: 15px; left: 15px; background: rgba(15, 15, 20, 0.85); border-left: 4px solid #d97706; padding: 10px; color: white;">
    <div style="font-weight: bold;">7 DAYS TO RAFT | ДЕНЬ ${stats.day}</div>
  </div>
  <div style="position: absolute; top: 15px; right: 15px; background: rgba(15, 15, 20, 0.85); padding: 10px; color: white;">
    Дерево: <span id="wood">0</span> | Камень: <span id="stone">0</span>
  </div>
  <div id="joy-base" style="position: absolute; bottom: 30px; left: 30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; pointer-events: auto;">
    <div id="joy-stick" style="width: 40px; height: 40px; background: #d97706; border-radius: 50%; position: absolute; top: 30px; left: 30px;"></div>
  </div>
  <button id="gather" style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); background: #d97706; color: white; padding: 15px 30px; border: none; font-weight: bold; pointer-events: auto; border-radius: 5px;">РУБИТЬ / КОПАТЬ</button>
`;
document.body.appendChild(hud);

document.getElementById('gather')!.addEventListener('click', () => {
  stats.wood += Math.floor(Math.random() * 3) + 1;
  stats.stone += Math.floor(Math.random() * 2);
  document.getElementById('wood')!.innerText = String(stats.wood);
  document.getElementById('stone')!.innerText = String(stats.stone);
});

// 3D Сцена
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5c94fc);
scene.fog = new THREE.FogExp2(0x5c94fc, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(20, 40, 20);
scene.add(sun);

// Остров (Low-Poly)
const islandMat = new THREE.MeshStandardMaterial({ color: 0x4a7c29, flatShading: true });
const island = new THREE.Mesh(new THREE.CylinderGeometry(25, 28, 2, 16), islandMat);
island.position.y = -1;
scene.add(island);

// Океан
const water = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x1ca3ec, transparent: true, opacity: 0.8 }));
water.rotation.x = -Math.PI / 2;
water.position.y = -1.5;
scene.add(water);

// Вулкан
const volcanoMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3b, flatShading: true });
const volcano = new THREE.Mesh(new THREE.CylinderGeometry(3, 12, 10, 10), volcanoMat);
volcano.position.y = 4;
scene.add(volcano);

// Лава внутри вулкана
const lava = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 10), new THREE.MeshBasicMaterial({ color: 0xff4500 }));
lava.position.y = 9;
scene.add(lava);
const lavaLight = new THREE.PointLight(0xff2200, 2, 20);
lavaLight.position.set(0, 10, 0);
scene.add(lavaLight);

// Генерация деревьев
function createTree(x: number, z: number) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 5), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
  trunk.position.y = 1;
  const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5), new THREE.MeshStandardMaterial({ color: 0x2d5a1e, flatShading: true }));
  leaves.position.y = 2.5;
  group.add(trunk, leaves);
  group.position.set(x, 0, z);
  scene.add(group);
}
for(let i=0; i<15; i++) {
  let angle = Math.random() * Math.PI * 2;
  let radius = 10 + Math.random() * 12;
  createTree(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

// Игрок (Капсула)
const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1, 4, 8), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
body.position.y = 1;
player.add(body);
player.position.set(0, 0, 15);
scene.add(player);

// Управление
let camAngle = 0, moveX = 0, moveZ = 0;
const stick = document.getElementById('joy-stick')!;
const base = document.getElementById('joy-base')!;
let touching = false, startX = 0, startY = 0;

base.addEventListener('touchstart', (e) => {
  touching = true;
  startX = e.touches[0].clientX; startY = e.touches[0].clientY;
});
window.addEventListener('touchmove', (e) => {
  if (!touching) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  const dist = Math.min(30, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  stick.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
  moveX = (Math.cos(angle) * dist) / 30;
  moveZ = (Math.sin(angle) * dist) / 30;
});
window.addEventListener('touchend', () => {
  touching = false; moveX = 0; moveZ = 0;
  stick.style.transform = `translate(0px, 0px)`;
});

let isSwiping = false, lastMouseX = 0;
window.addEventListener('touchstart', (e) => {
  if (e.touches[0].clientX > window.innerWidth / 2) { isSwiping = true; lastMouseX = e.touches[0].clientX; }
});
window.addEventListener('touchmove', (e) => {
  if (!isSwiping) return;
  for (let i = 0; i < e.touches.length; i++) {
    if (e.touches[i].clientX > window.innerWidth / 2) {
      camAngle -= (e.touches[i].clientX - lastMouseX) * 0.005;
      lastMouseX = e.touches[i].clientX;
    }
  }
});
window.addEventListener('touchend', () => { isSwiping = false; });

function animate() {
  requestAnimationFrame(animate);
  
  // Движение игрока
  if (moveZ !== 0 || moveX !== 0) {
    player.position.x += (-moveZ * Math.sin(camAngle) - moveX * Math.cos(camAngle)) * 0.15;
    player.position.z += (-moveZ * Math.cos(camAngle) + moveX * Math.sin(camAngle)) * 0.15;
    player.rotation.y = camAngle;
  }

  // Камера летит за игроком (вид от 3-го лица)
  camera.position.x = player.position.x + Math.sin(camAngle) * 8;
  camera.position.y = player.position.y + 4;
  camera.position.z = player.position.z + Math.cos(camAngle) * 8;
  camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

  renderer.render(scene, camera);
}
animate();
