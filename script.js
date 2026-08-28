// --- CONFIGURATION CONSTANTS ---
const BOARD_TILES = 10;        // 10x10 chessboard
const TILE_SIZE = 1.6;
const BOARD_SIZE = BOARD_TILES * TILE_SIZE;
const HALF_BOARD = BOARD_SIZE / 2;

// Half-sized balls & tighter grid step for dense, high-res dot matrix
const BALL_RADIUS = 0.12;
const GRID_STEP = 0.28;

// --- THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Deep rich obsidian background
const BG_COLOR = 0x080608;
scene.background = new THREE.Color(BG_COLOR);
scene.fog = new THREE.FogExp2(BG_COLOR, 0.018);

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10.5;
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

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x2a1a14, 2.4);
scene.add(ambientLight);

// Primary key light for glossy reflections
const dirLight = new THREE.DirectionalLight(0xfff0d6, 2.6);
dirLight.position.set(16, 30, 16);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -HALF_BOARD - 3;
dirLight.shadow.camera.right = HALF_BOARD + 3;
dirLight.shadow.camera.top = HALF_BOARD + 3;
dirLight.shadow.camera.bottom = -HALF_BOARD - 3;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

// Neon orange rim and underglow lights
const rimLight = new THREE.PointLight(0xff5500, 4.5, 40);
rimLight.position.set(-12, 14, -12);
scene.add(rimLight);

const bottomGlow = new THREE.PointLight(0xff3700, 2.5, 30);
bottomGlow.position.set(0, -4, 0);
scene.add(bottomGlow);

// --- BLACK & WHITE CHESSBOARD CREATION ---
const boardGroup = new THREE.Group();
scene.add(boardGroup);

const matWhiteTile = new THREE.MeshStandardMaterial({
  color: 0xf2f2f5,
  roughness: 0.12,
  metalness: 0.08,
});

const matBlackTile = new THREE.MeshStandardMaterial({
  color: 0x121216,
  roughness: 0.15,
  metalness: 0.25,
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

// Thick Obsidian Base
const baseGeo = new THREE.BoxGeometry(BOARD_SIZE + 0.8, 0.8, BOARD_SIZE + 0.8);
const baseMat = new THREE.MeshStandardMaterial({
  color: 0x080608,
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

// --- HIGH-DENSITY 7x5 BITMAP MATRICES FOR "PEMMYZ" ---
const FONT_MAP = {
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0]
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
  ],
  Z: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
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
totalWordWidth -= letterGap;

const wordOffsetX = -totalWordWidth / 2;
// Offset slightly downwards along Z so text sits nicely in the middle-to-lower portion
const WORD_Z_OFFSET = 1.6;

// --- SHARED BALL ASSETS & SHADOW TEXTURE ---
const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 20, 20);
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

// Corner coordinate targets for the 4-corner group bounce phase
const CORNERS = [
  { x: -5.0, z: -5.0 }, // Top-Left
  { x:  5.0, z: -5.0 }, // Top-Right
  { x: -5.0, z:  5.0 }, // Bottom-Left
  { x:  5.0, z:  5.0 }  // Bottom-Right
];

// Instantiate target ball coordinates
const balls = [];
let ballIndexCounter = 0;

letterLayouts.forEach((letter, letterIdx) => {
  const { matrix, startX } = letter;
  const rows = matrix.length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        const targetX = wordOffsetX + startX + c * GRID_STEP;
        const targetZ = (r - (rows - 1) / 2) * GRID_STEP + WORD_Z_OFFSET;

        const ballMat = new THREE.MeshStandardMaterial({
          color: 0xff6600,
          roughness: 0.12,
          metalness: 0.06,
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
        shadowMesh.position.y = 0.005;
        scene.add(shadowMesh);

        const currentIdx = ballIndexCounter++;
        const cornerIdx = currentIdx % 4;

        balls.push({
          mesh,
          shadowMesh,
          mat: ballMat,
          index: currentIdx,
          letterIdx,
          targetX,
          targetZ,
          cornerIdx,
          x: 0,
          z: 0,
          y: 0,
          vy: 0,
          gravity: -26,
          restitution: 0.46,
          squashTimer: 0,
          dropDelay: 0,
          settled: false,
          // Individual offsets for vortex and corner cluster animations
          tornadoOffset: (currentIdx / 85) * Math.PI * 6,
          tornadoHeight: 0.4 + (currentIdx / 85) * 6.5,
          cornerRadius: 0.4 + (currentIdx % 7) * 0.16,
          cornerAngleOffset: ((currentIdx * 137.5) * Math.PI) / 180,
          cornerFreq: 6.0 + (currentIdx % 5) * 0.7
        });
      }
    }
  }
});

// --- ANIMATION CHOREOGRAPHY PHASES ---
const PHASE_TORNADO = 0;   // 0.0s -> 2.6s : Swirling tornado vortex
const PHASE_CORNERS = 1;   // 2.6s -> 5.2s : Split & bounce in 4 corner groups
const PHASE_ASSEMBLE = 2;  // 5.2s -> End  : Cascading drops & bounce into "PEMMYZ"

const TORNADO_DURATION = 2.6;
const CORNERS_DURATION = 2.6;

let currentPhase = PHASE_TORNADO;
let phaseTimer = 0;

// --- CAMERA VIEW CONSTANTS & CONTROLS ---
const ISO_THETA = Math.PI / 4;                      // 45° Isometric angle
const ISO_PHI = Math.atan(Math.SQRT1_2);            // ~35.26° elevation
const TOP_DOWN_THETA = 0;                           // Front-facing top-down
const TOP_DOWN_PHI = Math.PI / 2 - 0.001;           // 90° straight down

const cameraDistance = 34;
let isDragging = false;
let pointerDownX = 0;
let pointerDownY = 0;
let previousPointerX = 0;
let previousPointerY = 0;

let targetTheta = ISO_THETA;
let targetPhi = ISO_PHI;
let currentTheta = targetTheta;
let currentPhi = targetPhi;

let targetZoom = 1.0;
let currentZoom = 1.0;

let autoTopDownTriggered = false;
let settleTimer = 0;

// Trigger / Replay Full Intro Sequence
function startIntroChoreography() {
  currentPhase = PHASE_TORNADO;
  phaseTimer = 0;
  autoTopDownTriggered = false;
  settleTimer = 0;

  targetTheta = ISO_THETA;
  targetPhi = ISO_PHI;
  targetZoom = 1.0;

  balls.forEach((ball) => {
    ball.settled = false;
    ball.squashTimer = 0;
    ball.vy = 0;
    ball.mat.emissive.setHex(0x441100);
  });
}

startIntroChoreography();

// --- USER INTERACTION CONTROLS ---
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
  targetPhi = Math.max(0.12, Math.min(Math.PI / 2 - 0.001, targetPhi));

  previousPointerX = e.clientX;
  previousPointerY = e.clientY;
});

window.addEventListener('pointerup', (e) => {
  if (isDragging) {
    const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
    // Click to replay full intro choreography
    if (dist < 6) {
      startIntroChoreography();
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

// --- MAIN ANIMATION LOOP ---
const clock = new THREE.Clock();
let totalTime = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);
  totalTime += dt;
  phaseTimer += dt;

  // --- PHASE TRANSITIONS ---
  if (currentPhase === PHASE_TORNADO && phaseTimer >= TORNADO_DURATION) {
    currentPhase = PHASE_CORNERS;
    phaseTimer = 0;
  } else if (currentPhase === PHASE_CORNERS && phaseTimer >= CORNERS_DURATION) {
    currentPhase = PHASE_ASSEMBLE;
    phaseTimer = 0;

    // Launch each ball into dropping cascade
    balls.forEach((ball) => {
      ball.dropDelay = ball.letterIdx * 0.14 + Math.random() * 0.12;
      ball.y = 10.0 + Math.random() * 4.5;
      ball.vy = -Math.random() * 3.0;
      ball.x = ball.targetX + (Math.random() - 0.5) * 1.5;
      ball.z = ball.targetZ + (Math.random() - 0.5) * 1.5;
      ball.settled = false;
      ball.squashTimer = 0;
    });
  }

  let allSettled = true;

  // --- BALL PHYSICS & CHOREOGRAPHY UPDATE ---
  balls.forEach((ball) => {
    // -------------------------------------------------------------
    // 1. TORNADO VORTEX PHASE
    // -------------------------------------------------------------
    if (currentPhase === PHASE_TORNADO) {
      allSettled = false;
      const t = phaseTimer;
      const swirlSpeed = 5.2;
      const angle = ball.tornadoOffset + t * swirlSpeed;
      
      // Funnel shape expanding with height
      const currentHeight = ball.tornadoHeight + Math.sin(t * 4.0 + ball.index) * 0.5;
      const radius = 0.6 + (currentHeight / 7.0) * 3.2;

      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;
      const ty = Math.max(BALL_RADIUS, currentHeight);

      ball.x = THREE.MathUtils.lerp(ball.x, tx, dt * 14);
      ball.z = THREE.MathUtils.lerp(ball.z, tz, dt * 14);
      ball.y = THREE.MathUtils.lerp(ball.y, ty, dt * 14);

      const glow = 0.3 + 0.3 * Math.sin(angle * 2.0);
      ball.mat.emissive.setRGB(glow * 0.9, glow * 0.28, 0.0);
    }
    // -------------------------------------------------------------
    // 2. FOUR CORNERS BOUNCING GROUPS PHASE
    // -------------------------------------------------------------
    else if (currentPhase === PHASE_CORNERS) {
      allSettled = false;
      const t = phaseTimer;
      const corner = CORNERS[ball.cornerIdx];

      // Orbit inside the assigned corner cluster
      const cornerOrbitAngle = ball.cornerAngleOffset + t * 4.0;
      const tx = corner.x + Math.cos(cornerOrbitAngle) * ball.cornerRadius;
      const tz = corner.z + Math.sin(cornerOrbitAngle) * ball.cornerRadius;

      // Vigorous rhythmic corner bouncing
      const bounceVal = Math.abs(Math.sin(t * ball.cornerFreq + ball.index * 0.4));
      const ty = BALL_RADIUS + bounceVal * 3.2;

      ball.x = THREE.MathUtils.lerp(ball.x, tx, dt * 12);
      ball.z = THREE.MathUtils.lerp(ball.z, tz, dt * 12);
      ball.y = THREE.MathUtils.lerp(ball.y, ty, dt * 16);

      // Bounce squash at impact
      if (bounceVal < 0.08) {
        ball.squashTimer = 0.08;
        ball.mat.emissive.setRGB(0.9, 0.35, 0.0);
      } else {
        ball.mat.emissive.setRGB(0.3, 0.08, 0.0);
      }
    }
    // -------------------------------------------------------------
    // 3. ASSEMBLE "PEMMYZ" BOUNCING DROP SEQUENCE
    // -------------------------------------------------------------
    else if (currentPhase === PHASE_ASSEMBLE) {
      if (ball.dropDelay > 0) {
        ball.dropDelay -= dt;
        ball.mesh.position.y = 100;
        ball.shadowMesh.material.opacity = 0;
        allSettled = false;
        return;
      }

      if (!ball.settled) {
        allSettled = false;

        // Magnetically steer towards target letter slot X-Z
        ball.x = THREE.MathUtils.lerp(ball.x, ball.targetX, dt * 9.5);
        ball.z = THREE.MathUtils.lerp(ball.z, ball.targetZ, dt * 9.5);

        // Vertical bounce physics integration
        ball.vy += ball.gravity * dt;
        ball.y += ball.vy * dt;

        // Ground collision & bouncing
        if (ball.y <= BALL_RADIUS) {
          ball.y = BALL_RADIUS;

          if (Math.abs(ball.vy) > 1.6) {
            ball.vy = -ball.vy * ball.restitution;
            ball.squashTimer = 0.11;
          } else {
            ball.vy = 0;
            ball.y = BALL_RADIUS;
            ball.x = ball.targetX;
            ball.z = ball.targetZ;
            ball.settled = true;
            ball.squashTimer = 0.08;
          }
        }
      }

      // Settled text wave glow pulse
      if (ball.settled) {
        const wave = Math.sin(totalTime * 4.0 - ball.x * 0.8);
        const glow = Math.max(0, wave);
        ball.mat.emissive.setRGB(0.22 + glow * 0.45, 0.06 + glow * 0.12, 0.0);
      }
    }

    // Apply Position
    ball.mesh.position.set(ball.x, ball.y, ball.z);

    // Squash and Stretch
    if (ball.squashTimer > 0) {
      ball.squashTimer -= dt;
      const progress = 1 - Math.max(0, ball.squashTimer / 0.11);
      const squashY = THREE.MathUtils.lerp(0.62, 1.0, progress);
      const squashXZ = THREE.MathUtils.lerp(1.28, 1.0, progress);
      ball.mesh.scale.set(squashXZ, squashY, squashXZ);
    } else {
      const stretchY = 1.0 + Math.min(Math.abs(ball.vy) * 0.02, 0.3);
      const stretchXZ = 1.0 / Math.sqrt(stretchY);
      ball.mesh.scale.set(stretchXZ, stretchY, stretchXZ);
    }

    // Dynamic Contact Shadow
    ball.shadowMesh.position.set(ball.x, 0.005, ball.z);
    const heightFactor = Math.max(0.0, 1 - (ball.y - BALL_RADIUS) / 5.0);
    ball.shadowMesh.scale.set(heightFactor, heightFactor, 1);
    ball.shadowMesh.material.opacity = 0.85 * heightFactor;
  });

  // --- AUTOMATIC TOP-DOWN CAMERA TRANSITION ---
  if (currentPhase === PHASE_ASSEMBLE && allSettled) {
    settleTimer += dt;
    if (settleTimer > 0.4 && !autoTopDownTriggered && !isDragging) {
      autoTopDownTriggered = true;
      targetTheta = TOP_DOWN_THETA;
      targetPhi = TOP_DOWN_PHI;
      targetZoom = 1.08;
    }
  }

  // Smooth Camera Interpolation
  currentTheta = THREE.MathUtils.lerp(currentTheta, targetTheta, dt * 3.5);
  currentPhi = THREE.MathUtils.lerp(currentPhi, targetPhi, dt * 3.5);
  currentZoom = THREE.MathUtils.lerp(currentZoom, targetZoom, dt * 3.5);

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

animate();
