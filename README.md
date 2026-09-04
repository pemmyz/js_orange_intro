# js_orange_intro

# js_orange_intro

A retro arcade-style 3D intro animation built with **HTML, CSS, JavaScript, and Three.js**.

The scene features a glossy black-and-white 10×10 chessboard, glowing orange balls, CRT-style visual effects, and an animated sequence that eventually assembles the balls into the word **PEMMYZ**.

## Features

- 3D rendering powered by [Three.js](https://threejs.org/)
- 10×10 black-and-white chessboard
- Glossy materials and dynamic shadows
- Neon orange lighting and emissive glow
- High-density bitmap lettering for `PEMMYZ`
- Three-stage intro animation:
  1. **Tornado vortex** — balls swirl in a funnel-shaped vortex
  2. **Four-corner bounce** — balls split into four groups and bounce around the board corners
  3. **Assembly** — balls drop and bounce into their final `PEMMYZ` positions
- Automatic camera transition to a top-down view after the word settles
- Interactive camera tilt by dragging
- Mouse-wheel zoom
- Click/tap to replay the complete intro
- Retro CRT scanlines and vignette overlay
- Responsive canvas resizing
- High-performance WebGL renderer configuration

## Project Structure

```text
js_orange_intro/
├── index.html
├── style.css
└── script.js
```

## Requirements

A modern web browser with WebGL support.

No build system, package manager, or local dependency installation is required.

Three.js is loaded directly from the CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

An internet connection is therefore required unless the Three.js library is downloaded and served locally.

## Running the Project

### Option 1 — Open directly

Open `index.html` in a modern browser.

For best compatibility, especially with browser security restrictions, use a local web server instead.

### Option 2 — Python HTTP server

From the project directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Controls

| Input | Action |
|---|---|
| Drag | Tilt / rotate the camera |
| Mouse wheel | Zoom in or out |
| Click | Replay the intro animation |

The on-screen HUD displays:

```text
DRAG TO TILT • SCROLL TO ZOOM • CLICK TO REPLAY
```

## Animation Sequence

### 1. Tornado Vortex

The orange balls begin in a swirling tornado-like formation.

The balls use individual offsets and heights to create a dense funnel effect while their emissive orange glow changes over time.

Duration: approximately **2.6 seconds**.

### 2. Four-Corner Bounce

The balls are divided into four groups and move toward the four corners of the chessboard.

Each ball orbits inside its assigned corner cluster while bouncing vertically with different frequencies and offsets.

Duration: approximately **2.6 seconds**.

### 3. PEMMYZ Assembly

The balls are launched above the board and gradually steer toward their assigned positions.

Each ball uses simple gravity and bounce physics before settling into the bitmap representation of:

```text
PEMMYZ
```

The letters are generated from 7×5 bitmap matrices.

After all balls have settled, the camera automatically transitions toward a top-down view.

## Visual Design

The project uses a dark retro-arcade aesthetic:

- Obsidian-black background
- Black-and-white chessboard
- Bright neon-orange balls
- Orange rim lighting
- Emissive materials
- Dynamic contact shadows
- CRT scanlines
- Vignette
- Monospaced HUD typography

The CSS CRT overlay combines a radial vignette with repeating horizontal scanlines.

## Three.js Configuration

The renderer is configured for high-performance WebGL:

```javascript
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
```

Device pixel ratio is capped at 2 to balance image quality and performance.

The scene uses:

- `OrthographicCamera`
- `MeshStandardMaterial`
- `AmbientLight`
- `DirectionalLight`
- `PointLight`
- Shadow mapping
- Exponential fog
- Canvas-generated shadow textures

## Custom Bitmap Font

The `PEMMYZ` lettering is not rendered using a traditional font.

Instead, each letter is represented by a 7×5 binary matrix. Every `1` in the matrix creates an orange 3D sphere.

Example:

```javascript
P: [
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0]
]
```

The letters are positioned automatically based on the configured grid spacing and letter gap.

## Main Configuration

Several visual and animation properties can be changed near the top of `script.js`.

### Board

```javascript
const BOARD_TILES = 10;
const TILE_SIZE = 1.6;
```

### Balls

```javascript
const BALL_RADIUS = 0.12;
const GRID_STEP = 0.28;
```

### Animation durations

```javascript
const TORNADO_DURATION = 2.6;
const CORNERS_DURATION = 2.6;
```

### Camera

The camera starts at an isometric-style angle and automatically transitions to a top-down view after the `PEMMYZ` formation has settled.

## Responsive Design

The renderer automatically updates when the browser window changes size:

```javascript
window.addEventListener('resize', () => {
  // Update camera projection and renderer size
});
```

This allows the animation to fill the available browser window.

## Browser Compatibility

The project requires a browser with WebGL and modern JavaScript support.

Recommended browsers include current versions of:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

Performance depends on the device's GPU and browser WebGL implementation.

## Credits

- **Three.js** — 3D rendering library
- Project concept and animation — **PEMMYZ**

## License

MIT License – free to use, modify, and redistribute.
