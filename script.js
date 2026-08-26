// --- CONFIGURATION CONSTANTS ---
const BOARD_TILES = 10;        // 10x10 chessboard
const TILE_SIZE = 1.6;
const BOARD_SIZE = BOARD_TILES * TILE_SIZE;
const HALF_BOARD = BOARD_SIZE / 2;
const BALL_COUNT = 26;
const BALL_RADIUS = 0.42;

// --- THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040100);
scene.fog = new THREE.FogExp2(0x040100, 0.025);

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
const ambientLight = new THREE.AmbientLight(0x3a2015, 2.0);
scene.add(ambientLight);

// Primary key light for sharp highlights on glossy black & white tiles
const dirLight = new THREE.DirectionalLight(0xfff0d0, 2.2);
dirLight.position.set(16, 26, 16);
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
const rimLight = new THREE.PointLight(0xff5500, 4.5, 40);
rimLight.position.set(-14, 12, -14);
scene.add(rimLight);

const bottomGlow = new THREE.PointLight(0xff3300, 2.0, 25);
bottomGlow.position.set(0, -4, 0);
scene.add(bottomGlow);

// --- PLANCK.JS 2D PHYSICS SETUP (Horizontal X-Z Dynamics) ---
const pl = planck;
const world = new pl.World({
  gravity: pl.Vec2(0, 0) // Frictionless elastic arcade bounces
});

// Perimeter walls
const groundBody = world.createBody();
const wallLimit = HALF_BOARD - BALL_RADIUS;

groundBody.createFixture(pl.Edge(pl.Vec2(-wallLimit, -wallLimit), pl.Vec2(wallLimit, -wallLimit)), { restitution: 1.0, friction: 0 });
groundBody.createFixture(pl.Edge(pl.Vec2(wallLimit, -wallLimit), pl.Vec2(wallLimit, wallLimit)), { restitution: 1.0, friction: 0 });
groundBody.createFixture(pl.Edge(pl.Vec2(wallLimit, wallLimit), pl.Vec2(-wallLimit, wallLimit)), { restitution: 1.0, friction: 0 });
groundBody.createFixture(pl.Edge(pl.Vec2(-wallLimit, wallLimit), pl.Vec2(-wallLimit, -wallLimit)), { restitution: 1.0, friction: 0 });

// --- BLACK & WHITE CHESSBOARD CREATION ---
const boardGroup = new THREE.Group();
scene.add(boardGroup);

// Glossy White & Obsidian Black Tile Materials
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

// --- ORANGE BALLS & VERTICAL BOUNCE SETUP ---
const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 28, 28);
const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0xff6600,
  roughness: 0.1,
  metalness: 0.05,
  emissive: 0x330c00
});

// Soft Circular Shadow Texture
const shadowGeo = new THREE.PlaneGeometry(BALL_RADIUS * 2.2, BALL_RADIUS * 2.2);
const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = 64;
shadowCanvas.height = 64;
const sCtx = shadowCanvas.getContext('2d');
const gradient = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
gradient.addColorStop(0, 'rgba(0,0,0,0.85)');
gradient.addColorStop(0.6, 'rgba(15,3,0,0.4)');
gradient.addColorStop(1, 'rgba(0,0,0,0)');
sCtx.fillStyle = gradient;
sCtx.fillRect(0, 0, 64, 64);

const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
const shadowMaterial = new THREE.MeshBasicMaterial({
  map: shadowTexture,
  transparent: true,
  opacity: 0.8,
  depthWrite: false
});

const balls = [];

for (let i = 0; i < BALL_COUNT; i++) {
  const mesh = new THREE.Mesh(ballGeometry, ballMaterial.clone());
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  scene.add(mesh);

  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  scene.add(shadowMesh);

  const px = (Math.random() - 0.5) * (BOARD_SIZE - 2);
  const pz = (Math.random() - 0.5) * (BOARD_SIZE - 2);

  const body = world.createBody({
    type: 'dynamic',
    position: pl.Vec2(px, pz),
    linearDamping: 0.0,
    angularDamping: 0.1
  });

  body.createFixture(pl.Circle(BALL_RADIUS), {
    density: 1.0,
    friction: 0.0,
    restitution: 1.0
  });

  const speed = 2.5 + Math.random() * 3.5;
  const angle = Math.random() * Math.PI * 2;
  body.setLinearVelocity(pl.Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed));

  balls.push({
    mesh,
    shadowMesh,
    body,
    y: BALL_RADIUS + Math.random() * 3.0,
    vy: Math.random() * 2.0,
    maxHeight: 2.2 + Math.random() * 2.8,
    gravity: -18 - Math.random() * 4,
    squashTimer: 0
  });
}

// --- INTERACTIVE TILT & ZOOM CONTROLS ---
const cameraDistance = 34;
let isDragging = false;
let previousPointerX = 0;
let previousPointerY = 0;

// Spherical coordinates (Default: classic isometric angle)
let targetTheta = Math.PI / 4;                      // Horizontal azimuth (45°)
let targetPhi = Math.atan(Math.SQRT1_2);            // Elevation (~35.264° from horizon => ~54.7° from Y)
let currentTheta = targetTheta;
let currentPhi = targetPhi;

let targetZoom = 1.0;
let currentZoom = 1.0;

// Mouse & Touch Interaction Handlers
window.addEventListener('pointerdown', (e) => {
  isDragging = true;
  previousPointerX = e.clientX;
  previousPointerY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousPointerX;
  const deltaY = e.clientY - previousPointerY;

  // Horizontal rotation
  targetTheta -= deltaX * 0.007;
  
  // Vertical tilt (Clamped to avoid dipping under the board or pole flipping)
  targetPhi += deltaY * 0.007;
  targetPhi = Math.max(0.18, Math.min(Math.PI / 2 - 0.05, targetPhi));

  previousPointerX = e.clientX;
  previousPointerY = e.clientY;
});

window.addEventListener('pointerup', () => { isDragging = false; });
window.addEventListener('pointercancel', () => { isDragging = false; });

// Mouse Wheel Zoom
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  targetZoom = Math.max(0.45, Math.min(2.8, targetZoom * zoomFactor));
}, { passive: false });

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
const PHYSICS_STEP = 1 / 60;
let accumulator = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);
  accumulator += dt;

  // Step Planck.js 2D Physics
  while (accumulator >= PHYSICS_STEP) {
    world.step(PHYSICS_STEP);
    accumulator -= PHYSICS_STEP;
  }

  // Update Balls Vertical Movement + Squash & Stretch
  balls.forEach(ball => {
    // 1. Sync X & Z with Planck physics body
    const pos = ball.body.getPosition();
    ball.mesh.position.x = pos.x;
    ball.mesh.position.z = pos.y;

    // 2. Vertical Y Bounce Integration
    ball.vy += ball.gravity * dt;
    ball.y += ball.vy * dt;

    if (ball.y <= BALL_RADIUS) {
      ball.y = BALL_RADIUS;
      ball.vy = Math.sqrt(-2 * ball.gravity * ball.maxHeight);
      ball.squashTimer = 0.14; // trigger impact deformation
    }

    ball.mesh.position.y = ball.y;

    // 3. Squash and Stretch
    if (ball.squashTimer > 0) {
      ball.squashTimer -= dt;
      const progress = 1 - Math.max(0, ball.squashTimer / 0.14);
      const squashY = THREE.MathUtils.lerp(0.65, 1.0, progress);
      const squashXZ = THREE.MathUtils.lerp(1.25, 1.0, progress);
      ball.mesh.scale.set(squashXZ, squashY, squashXZ);
    } else {
      const stretchY = 1.0 + Math.min(Math.abs(ball.vy) * 0.02, 0.25);
      const stretchXZ = 1.0 / Math.sqrt(stretchY);
      ball.mesh.scale.set(stretchXZ, stretchY, stretchXZ);
    }

    // 4. Update Dynamic Contact Shadow
    ball.shadowMesh.position.x = pos.x;
    ball.shadowMesh.position.z = pos.y;
    const heightFactor = Math.max(0.1, 1 - (ball.y - BALL_RADIUS) / 5.0);
    ball.shadowMesh.scale.set(heightFactor, heightFactor, 1);
    ball.shadowMesh.material.opacity = 0.85 * heightFactor;
  });

  // Smoothly interpolate Camera Angles & Zoom
  currentTheta = THREE.MathUtils.lerp(currentTheta, targetTheta, 0.1);
  currentPhi = THREE.MathUtils.lerp(currentPhi, targetPhi, 0.1);
  currentZoom = THREE.MathUtils.lerp(currentZoom, targetZoom, 0.12);

  camera.zoom = currentZoom;
  camera.updateProjectionMatrix();

  // Position camera on spherical coordinates
  camera.position.x = cameraDistance * Math.cos(currentPhi) * Math.sin(currentTheta);
  camera.position.y = cameraDistance * Math.sin(currentPhi);
  camera.position.z = cameraDistance * Math.cos(currentPhi) * Math.cos(currentTheta);
  camera.lookAt(0, -0.3, 0);

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
