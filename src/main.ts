import * as THREE from 'three';

// Инициализация игры "7 Days to Raft[span_0](start_span)"[span_0](end_span)
const container = document.createElement('div');
document.body.appendChild(container);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = '#0b0f19';

let stats = {
  health: 100,
  hunger: 100,
  thirst: 100,
  wood: 0,
  stone: 0,
  day: 1
};

// Rust/Oxide-стиль HUD с инвентарем и кнопкой сбора ресурсов[span_1](start_span)[span_1](end_span)
const hud = document.createElement('div');
hud.style.position = 'absolute';
hud.style.top = '0';
hud.style.left = '0';
hud.style.width = '100%';
hud.style.height = '100%';
hud.style.pointerEvents = 'none';
hud.style.fontFamily = 'Courier New, monospace';
hud.style.color = '#e0e0e0';

hud.innerHTML = `
  <div style="position: absolute; top: 15px; left: 15px; background: rgba(15, 15, 20, 0.85); border-left: 4px solid #d97706; padding: 10px 15px; border-radius: 4px;">
    <div style="font-size: 12px; color: #d97706; font-weight: bold; letter-spacing: 1px;">7 DAYS TO RAFT</div>
    <div style="font-size: 16px; font-weight: bold; margin-top: 2px;">ДЕНЬ ${stats.day} / 7</div>
    <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">Вулкан: Спокоен</div>
  </div>

  <div style="position: absolute; top: 15px; right: 20px; background: rgba(15, 15, 20, 0.85); border: 1px solid #374151; padding: 8px 12px; border-radius: 4px; font-size: 12px;">
    <div>Дерево: <span id="wood-count">0</span></div>
    <div>Камень: <span id="stone-count">0</span></div>
  </div>

  <div id="joystick-base" style="position: absolute; bottom: 30px; left: 30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; pointer-events: auto; display: flex; align-items: center; justify-content: center;">
    <div id="joystick-stick" style="width: 40px; height: 40px; background: rgba(217,119,6,0.8); border-radius: 50%; position: absolute;"></div>
  </div>

  <div style="position: absolute; bottom: 35%; left: 50%; transform: translateX(-50%); pointer-events: auto;">
    <button id="gather-btn" style="background: #d97706; color: white; border: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); cursor: pointer;">СОБРАТЬ РЕСУРСЫ</button>
  </div>

  <div style="position: absolute; bottom: 25px; right: 20px; display: flex; flex-direction: column; gap: 6px; width: 180px;">
    <div>
      <div style="font-size: 10px; color: #ef4444; margin-bottom: 2px;">ЗДОРОВЬЕ: 100%</div>
      <div style="background: rgba(0,0,0,0.5); height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: #ef4444; width: 100%; height: 100%;"></div></div>
    </div>
    <div>
      <div style="font-size: 10px; color: #f59e0b; margin-bottom: 2px;">ГОЛОД: 100%</div>
      <div style="background: rgba(0,0,0,0.5); height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: #f59e0b; width: 100%; height: 100%;"></div></div>
    </div>
    <div>
      <div style="font-size: 10px; color: #3b82f6; margin-bottom: 2px;">ЖАЖДА: 100%</div>
      <div style="background: rgba(0,0,0,0.5); height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: #3b82f6; width: 100%; height: 100%;"></div></div>
    </div>
  </div>
`;
document.body.appendChild(hud);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2332);
scene.fog = new THREE.FogExp2(0x1a2332, 0.03);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x404050, 1.2));
const dirLight = new THREE.DirectionalLight(0xffedd5, 1.5);
dirLight.position.set(15, 25, 15);
scene.add(dirLight);

// Остров и вулкан[span_2](start_span)[span_2](end_span)
const island = new THREE.Mesh(
  new THREE.CylinderGeometry(6, 7, 1.5, 32),
  new THREE.MeshStandardMaterial({ color: 0x3d4a32, roughness: 0.9 })
);
island.position.y = -0.75;
scene.add(island);

const volcano = new THREE.Mesh(
  new THREE.ConeGeometry(2.5, 3, 16),
  new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.95 })
);
volcano.position.set(0, 0.75, 0);
scene.add(volcano);

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x0e2a3a, roughness: 0.2 })
);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.5;
scene.add(water);

// Кнопка сбора базовых ресурсов[span_3](start_span)[span_3](end_span)
document.getElementById('gather-btn')!.addEventListener('click', () => {
  stats.wood += 2;
  stats.stone += 1;
  document.getElementById('wood-count')!.innerText = String(stats.wood);
  document.getElementById('stone-count')!.innerText = String(stats.stone);
});

// Управление движением и камерой
let playerX = 0, playerZ = 4, camAngle = 0, moveX = 0, moveZ = 0;
const stick = document.getElementById('joystick-stick')!;
const base = document.getElementById('joystick-base')!;
let touching = false, startX = 0, startY = 0;

base.addEventListener('touchstart', (e) => {
  touching = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
  if (!touching) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  const dist = Math.min(35, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  stick.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
  moveX = (Math.cos(angle) * dist) / 35;
  moveZ = (Math.sin(angle) * dist) / 35;
});

window.addEventListener('touchend', () => {
  touching = false;
  moveX = 0; moveZ = 0;
  stick.style.transform = `translate(0px, 0px)`;
});

let isSwiping = false, lastMouseX = 0;
window.addEventListener('touchstart', (e) => {
  if (e.touches[0].clientX > window.innerWidth / 2) {
    isSwiping = true;
    lastMouseX = e.touches[0].clientX;
  }
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

  if (moveZ !== 0 || moveX !== 0) {
    playerX += (-moveZ * Math.sin(camAngle) - moveX * Math.cos(camAngle)) * 0.08;
    playerZ += (-moveZ * Math.cos(camAngle) + moveX * Math.sin(camAngle)) * 0.08;
  }

  camera.position.x = playerX + Math.sin(camAngle) * 6;
  camera.position.y = 2.5;
  camera.position.z = playerZ + Math.cos(camAngle) * 6;
  camera.lookAt(playerX, 0.5, playerZ);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
