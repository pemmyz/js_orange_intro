// --- CONFIGURATION CONSTANTS ---
const BOARD_TILES = 10;        // 10x10 chessboard
const TILE_SIZE = 1.6;
const BOARD_SIZE = BOARD_TILES * TILE_SIZE;
const HALF_BOARD = BOARD_SIZE / 2;
const BALL_RADIUS = 0.24;
const GRID_STEP = 0.54;

// --- THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040100);
scene.fog = new THREE.FogExp2(0x040100, 0.022);

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 11;
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect,
  frustumSize * aspect,
  frustumSize,
  -frustumSize,
  1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- LIGHTING (Warm Retro Specular & Orange Edge Reflections) ---
const ambientLight = new THREE.AmbientLight(0x3a2015, 2.2);
scene.add(ambientLight);

// Primary key light for sharp highlights on glossy black & white tiles
const dirLight = new THREE.DirectionalLight(0xfff2d4, 2.4);
dirLight.position.set(16, 28, 16);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -HALF_BOARD - 3;
dirLight.shadow.camera.right = HALF_BOARD + 3;
dirLight.shadow.camera.top = HALF_BOARD + 3;
dirLight.shadow.camera.bottom = -HALF_BOARD - 3;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

// Vibrant orange rim light to preserve the retro arcade aesthetic
const rimLight = new THREE.PointLight(0xff5500, 5.0, 45);
rimLight.position.set(-14, 14, -14);
scene.add(rimLight);

const bottomGlow = new THREE.PointLight(0xff3300, 2.2, 30);
bottomGlow.position.set(0, -4, 0);
scene.add(bottomGlow);

// --- BLACK & WHITE CHESSBOARD CREATION ---
const boardGroup = new THREE.Group();
scene.add(boardGroup);

const matWhiteTile = new THREE.MeshStandardMaterial({
  color: 0xf5f5f7,
  roughness: 0.12,
  metalness: 0.1,
});

const matBlackTile = new THREE.MeshStandardMaterial({
  color: 0x111114,
  roughness: 0.15,
  metalness: 0.2,
});

const tileGeo = new THREE.BoxGeometry(TILE_SIZE * 0.98, 0.4, TILE_SIZE * 0.98);

for (let i = 0; i < BOARD_TILES; i++) {
  for (let j = 0; j < BOARD_TILES; j++) {
    const isEven = (i + j) % 2 === 0;
    const tile = new THREE.Mesh(tileGeo, isEven ? matWhiteTile : matBlackTile);
    const x = (i - BOARD_TILES / 2 + 0.5) * TILE_SIZE;
    const z = (j - BOARD_TILES / 2 + 0.5) * TILE_SIZE;
    tile.position.set(x, -0.2, z);
    tile.receiveShadow = true;
    boardGroup.add(tile);
  }
}

// Thick Wooden/Obsidian Base
const baseGeo = new THREE.BoxGeometry(BOARD_SIZE + 0.8, 0.8, BOARD_SIZE + 0.8);
const baseMat = new THREE.MeshStandardMaterial({
  color: 0x090503,
  roughness: 0.35,
  metalness: 0.3
});
const boardBase = new THREE.Mesh(baseGeo, baseMat);
boardBase.position.set(0, -0.6, 0);
boardBase.receiveShadow = true;
boardGroup.add(boardBase);

// Outer Neon Orange Bevel Border Trim
const borderGeo = new THREE.BoxGeometry(BOARD_SIZE + 0.9, 0.15, BOARD_SIZE + 0.9);
const borderMat = new THREE.MeshStandardMaterial({
  color: 0xff5500,
  emissive: 0x661800,
  roughness: 0.18
});
const boardBorder = new THREE.Mesh(borderGeo, borderMat);
boardBorder.position.set(0, -0.15, 0);
boardGroup.add(boardBorder);

// --- "PEMMYZ" 5x3 / 5x5 BITMAP DOT MATRICES ---
const FONT_MAP = {
  P: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0]
  ],
  E: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1]
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
  ],
  Y: [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ],
  Z: [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 1]
  ]
};

// Calculate letter layouts and world coordinates for "PEMMYZ"
const WORD = "PEMMYZ";
const letterGap = GRID_STEP * 1.5;
let totalWordWidth = 0;

const letterLayouts = WORD.split('').map((char) => {
  const matrix = FONT_MAP[char];
  const cols = matrix[0].length;
  const width = (cols - 1) * GRID_STEP;
  const layout = { char, matrix, cols, width, startX: totalWordWidth };
  totalWordWidth += width + letterGap;
  return layout;
});
totalWordWidth -= letterGap; // Remove trailing gap

// Center the word around (0, 0)
const wordOffsetX = -totalWordWidth / 2;

// --- SHARED BALL ASSETS & SHADOW TEXTURE ---
const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 28, 28);
const shadowGeo = new THREE.PlaneGeometry(BALL_RADIUS * 2.8, BALL_RADIUS * 2.8);

const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = 64;
shadowCanvas.height = 64;
const sCtx = shadowCanvas.getContext('2d');
const gradient = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
gradient.addColorStop(0, 'rgba(0,0,0,0.9)');
gradient.addColorStop(0.5, 'rgba(20,5,0,0.45)');
gradient.addColorStop(1, 'rgba(0,0,0,0)');
sCtx.fillStyle = gradient;
sCtx.fillRect(0, 0, 64, 64);

const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

// Instantiate target ball coordinates
const balls = [];

letterLayouts.forEach((letter, letterIdx) => {
  const { matrix, startX } = letter;
  const rows = matrix.length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        const targetX = wordOffsetX + startX + c * GRID_STEP;
        const targetZ = (r - (rows - 1) / 2) * GRID_STEP;

        // Individual ball material for color wave pulse
        const ballMat = new THREE.MeshStandardMaterial({
          color: 0xff6600,
          roughness: 0.1,
          metalness: 0.05,
          emissive: 0x330c00
        });

        const mesh = new THREE.Mesh(ballGeometry, ballMat);
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        scene.add(mesh);

        const shadowMat = new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          opacity: 0.85,
          depthWrite: false
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.01;
        scene.add(shadowMesh);

        balls.push({
          mesh,
          shadowMesh,
          mat: ballMat,
          letterIdx,
          targetX,
          targetZ,
          x: targetX,
          z: targetZ,
          y: 0,
          vy: 0,
          gravity: -28,
          restitution: 0.48,
          squashTimer: 0,
          dropDelay: 0,
          settled: false
        });
      }
    }
  }
});

// Reset / Start Bounce Sequence
function triggerBounceSequence() {
  balls.forEach((ball) => {
    // Dynamic sequential drop from left to right ('P' -> 'Z')
    ball.dropDelay = ball.letterIdx * 0.16 + Math.random() * 0.12;
    ball.y = 12 + Math.random() * 6.0;
    ball.vy = -Math.random() * 4.0;
    ball.x = ball.targetX + (Math.random() - 0.5) * 1.5;
    ball.z = ball.targetZ + (Math.random() - 0.5) * 1.5;
    ball.settled = false;
    ball.squashTimer = 0;
    ball.mesh.position.set(ball.x, ball.y, ball.z);
    ball.mat.emissive.setHex(0x330c00);
  });
}

triggerBounceSequence();

// --- INTERACTIVE TILT, ZOOM & CLICK CONTROLS ---
const cameraDistance = 34;
let isDragging = false;
let pointerDownX = 0;
let pointerDownY = 0;
let previousPointerX = 0;
let previousPointerY = 0;

// Classic isometric camera angle
let targetTheta = Math.PI / 4;                      // 45° azimuth
let targetPhi = Math.atan(Math.SQRT1_2);            // ~35.26° elevation
let currentTheta = targetTheta;
let currentPhi = targetPhi;

let targetZoom = 1.0;
let currentZoom = 1.0;

window.addEventListener('pointerdown', (e) => {
  isDragging = true;
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
  previousPointerX = e.clientX;
  previousPointerY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousPointerX;
  const deltaY = e.clientY - previousPointerY;

  targetTheta -= deltaX * 0.007;
  targetPhi += deltaY * 0.007;
  targetPhi = Math.max(0.18, Math.min(Math.PI / 2 - 0.05, targetPhi));

  previousPointerX = e.clientX;
  previousPointerY = e.clientY;
});

window.addEventListener('pointerup', (e) => {
  if (isDragging) {
    const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
    // Click to replay drop sequence
    if (dist < 6) {
      triggerBounceSequence();
    }
  }
  isDragging = false;
});
window.addEventListener('pointercancel', () => { isDragging = false; });

// Mouse Wheel Zoom
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  targetZoom = Math.max(0.45, Math.min(2.8, targetZoom * zoomFactor));
}, { passive: false });

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
let totalTime = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);
  totalTime += dt;

  let allSettled = true;

  balls.forEach((ball) => {
    // Staggered drop delay
    if (ball.dropDelay > 0) {
      ball.dropDelay -= dt;
      ball.mesh.position.y = 100; // Keep off-screen until drop
      ball.shadowMesh.material.opacity = 0;
      allSettled = false;
      return;
    }

    if (!ball.settled) {
      allSettled = false;

      // Homing movement towards letter slot X-Z
      ball.x = THREE.MathUtils.lerp(ball.x, ball.targetX, dt * 10);
      ball.z = THREE.MathUtils.lerp(ball.z, ball.targetZ, dt * 10);

      // Vertical bounce integration
      ball.vy += ball.gravity * dt;
      ball.y += ball.vy * dt;

      // Ground impact detection
      if (ball.y <= BALL_RADIUS) {
        ball.y = BALL_RADIUS;

        if (Math.abs(ball.vy) > 1.8) {
          // Bounce up with decaying elasticity
          ball.vy = -ball.vy * ball.restitution;
          ball.squashTimer = 0.12;
        } else {
          // Settle permanently in place
          ball.vy = 0;
          ball.y = BALL_RADIUS;
          ball.x = ball.targetX;
          ball.z = ball.targetZ;
          ball.settled = true;
          ball.squashTimer = 0.08;
        }
      }
    }

    ball.mesh.position.set(ball.x, ball.y, ball.z);

    // Squash and Stretch
    if (ball.squashTimer > 0) {
      ball.squashTimer -= dt;
      const progress = 1 - Math.max(0, ball.squashTimer / 0.12);
      const squashY = THREE.MathUtils.lerp(0.62, 1.0, progress);
      const squashXZ = THREE.MathUtils.lerp(1.28, 1.0, progress);
      ball.mesh.scale.set(squashXZ, squashY, squashXZ);
    } else {
      const stretchY = 1.0 + Math.min(Math.abs(ball.vy) * 0.02, 0.3);
      const stretchXZ = 1.0 / Math.sqrt(stretchY);
      ball.mesh.scale.set(stretchXZ, stretchY, stretchXZ);
    }

    // Dynamic Contact Shadow
    ball.shadowMesh.position.set(ball.x, 0.01, ball.z);
    const heightFactor = Math.max(0.0, 1 - (ball.y - BALL_RADIUS) / 6.0);
    ball.shadowMesh.scale.set(heightFactor, heightFactor, 1);
    ball.shadowMesh.material.opacity = 0.85 * heightFactor;

    // Glowing wave effect once settled in place
    if (ball.settled) {
      const wave = Math.sin(totalTime * 4.0 - ball.x * 0.8);
      const glow = Math.max(0, wave);
      ball.mat.emissive.setRGB(0.2 + glow * 0.45, 0.05 + glow * 0.12, 0.0);
    }
  });

  // Smoothly interpolate Camera Angles & Zoom
  currentTheta = THREE.MathUtils.lerp(currentTheta, targetTheta, 0.1);
  currentPhi = THREE.MathUtils.lerp(currentPhi, targetPhi, 0.1);
  currentZoom = THREE.MathUtils.lerp(currentZoom, targetZoom, 0.12);

  camera.zoom = currentZoom;
  camera.updateProjectionMatrix();

  camera.position.x = cameraDistance * Math.cos(currentPhi) * Math.sin(currentTheta);
  camera.position.y = cameraDistance * Math.sin(currentPhi);
  camera.position.z = cameraDistance * Math.cos(currentPhi) * Math.cos(currentTheta);
  camera.lookAt(0, -0.2, 0);

  renderer.render(scene, camera);
}

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
  const currentAspect = window.innerWidth / window.innerHeight;
  camera.left = -frustumSize * currentAspect;
  camera.right = frustumSize * currentAspect;
  camera.top = frustumSize;
  camera.bottom = -frustumSize;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
animate();
