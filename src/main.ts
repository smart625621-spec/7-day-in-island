import * as THREE from 'three';

// Инициализация сцены
const container = document.createElement('div');
document.body.appendChild(container);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = '#0b0f19';

// Rust/Oxide-стиль интерфейса (тёмный тактический HUD с оранжевыми акцентами)
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
    <div style="font-size: 16px; font-weight: bold; margin-top: 2px;">ДЕНЬ 1 / 7</div>
    <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">Вулкан: Спокоен</div>
  </div>

  <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; pointer-events: auto;">
    <div style="width: 50px; height: 50px; background: rgba(20,20,25,0.9); border: 1px solid #374151; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">1</div>
    <div style="width: 50px; height: 50px; background: rgba(20,20,25,0.9); border: 1px solid #374151; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">2</div>
    <div style="width: 50px; height: 50px; background: rgba(20,20,25,0.9); border: 1px solid #374151; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">3</div>
    <div style="width: 50px; height: 50px; background: rgba(20,20,25,0.9); border: 1px solid #374151; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">4</div>
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

// Three.js сцена с мрачноватым выживальческим освещением
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2332);
scene.fog = new THREE.FogExp2(0x1a2332, 0.03);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Свет
const ambientLight = new THREE.AmbientLight(0x404050, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffedd5, 1.5);
dirLight.position.set(15, 25, 15);
scene.add(dirLight);

// Остров
const islandGeo = new THREE.CylinderGeometry(6, 7, 1.5, 32);
const islandMat = new THREE.MeshStandardMaterial({ color: 0x3d4a32, roughness: 0.9 });
const island = new THREE.Mesh(islandGeo, islandMat);
island.position.y = -0.75;
scene.add(island);

// Вулкан
const volcanoGeo = new THREE.ConeGeometry(2.5, 3, 16);
const volcanoMat = new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.95 });
const volcano = new THREE.Mesh(volcanoGeo, volcanoMat);
volcano.position.set(0, 0.75, 0);
scene.add(volcano);

// Океан
const waterGeo = new THREE.PlaneGeometry(200, 200);
const waterMat = new THREE.MeshStandardMaterial({ color: 0x0e2a3a, roughness: 0.2 });
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.5;
scene.add(water);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
