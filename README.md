# 🌊 Underwater Exploration - Interactive 3D Experience

An immersive, browser-based underwater exploration experience combining **Three.js 3D rendering** with **MediaPipe gesture recognition**. Navigate through a dream-like underwater room using hand gestures and keyboard controls to find a lost teddy bear hidden in a treasure chest.

![Three.js](https://img.shields.io/badge/Three.js-0.160.0-blue) ![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-green) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

---

## 🎯 Experience Overview

Dive into a bright, calming underwater installation where light pours through the water surface. The experience features:

- **3D Underwater Room**: Walls, floor, and an opening to the surface with volumetric lighting
- **Gesture-Based Navigation**: Control camera movement using webcam hand tracking
- **Intelligent Fish AI**: Schools of fish with flocking behavior that react to your presence
- **Treasure Hunt**: Find and open a treasure chest containing a lost teddy bear
- **Real-time Mini-map**: Top-down view showing your position, fish, and treasure location
- **Atmospheric Effects**: God rays, caustics, floating particles, and ambient lighting

The overall aesthetic is **dream-like, gentle, and installation-style** — not gamey or cluttered.

---

## ✨ Key Features

### 🐟 **Fish System**
- 15 animated fish with unique personalities
- **Boids flocking algorithm**: Cohesion, separation, and alignment behaviors
- React to player proximity (scatter or orbit)
- Simple geometric models with tail animation
- Colorful variety (orange, blue, green, purple)

### 🎮 **Dual Input System**
**Gesture Control (Webcam):**
- **Left palm** (open hand facing camera) → Rotate left
- **Right palm** (open hand facing camera) → Rotate right
- **Right fist** (closed hand) → Open treasure chest

**Keyboard Controls:**
- **Space** → Swim forward
- **← / →** → Rotate camera left/right
- **E** → Interact with chest

### 💎 **Treasure Interaction**
- Randomized chest location on each page load
- Glowing effect guides you to the treasure
- When opened:
  - Teddy bear floats upward gracefully
  - On-screen message: "I found my teddy bear!"
  - Chest lid animates smoothly

### 🗺️ **Mini-Map Viewport**
- Top-right overlay showing room layout
- **Blue arrow**: Your position and facing direction
- **Black square with gold outline**: Treasure chest
- **Small blue dots**: Fish positions
- Real-time updates

### 🌅 **Atmospheric Rendering**
- Volumetric god rays streaming from above
- Animated caustic lighting effects
- Particle system (bubbles and floating dust)
- Water surface animation
- Underwater fog and ambient lighting

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Webcam (for gesture controls - optional but recommended)
- **No installation or build process required!**

### Running Locally

#### Option 1: Direct File Access
Simply open `index.html` in your browser.

#### Option 2: Local Server (Recommended)

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js:**
```bash
npx serve
```

**PHP:**
```bash
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### First-Time Setup

1. Open the experience in your browser
2. Wait for resources to load (progress bar shown)
3. **Grant webcam permission** when prompted (required for gesture control)
4. Click **"Enter the Ocean"** to begin
5. Use gestures or keyboard to explore!

---

## 🎮 Controls & Interaction

### Navigation

| Input | Action |
|-------|--------|
| **Space** | Swim forward (smooth acceleration) |
| **← / →** | Rotate camera left/right |
| **Left Palm Gesture** | Rotate left (smooth) |
| **Right Palm Gesture** | Rotate right (smooth) |

### Interaction

| Input | Action |
|-------|--------|
| **E Key** | Open chest (when nearby) |
| **Right Fist Gesture** | Open chest (when nearby) |

### UI Controls

| Button | Function |
|--------|----------|
| **👋 Gestures** | Toggle gesture recognition on/off |
| **🗺️ Mini-map** | Toggle mini-map visibility |
| **⛶ Fullscreen** | Enter/exit fullscreen mode |

---

## 📐 Project Structure

```
underwater-exploration/
│
├── index.html              # Main HTML structure
├── style.css               # UI styling and overlays
├── README.md              # This file
│
└── js/
    ├── main.js            # Application entry point and coordinator
    ├── Environment.js     # Room, lighting, particles, caustics
    ├── CameraController.js # First-person camera movement
    ├── GestureController.js # MediaPipe hand tracking integration
    ├── Fish.js            # Fish AI and flocking behavior
    ├── TreasureChest.js   # Treasure chest and teddy bear
    └── MiniMap.js         # Top-down viewport renderer
```

---

## 🔧 Technical Architecture

### Core Technologies

- **Three.js r160**: 3D rendering engine
- **MediaPipe Hands**: Real-time hand tracking
- **Vanilla JavaScript ES6+**: No frameworks, no build process
- **HTML5 Canvas 2D**: Mini-map rendering

### Module Overview

#### `main.js` - Application Coordinator
- Initializes all subsystems
- Manages application lifecycle (loading, starting, animating)
- Coordinates interactions between modules
- Main animation loop

#### `Environment.js` - Scene Builder
- Creates underwater room (walls, floor, ceiling)
- Lighting system (ambient, directional, point lights)
- Volumetric god rays (cone meshes with additive blending)
- Particle system (200+ floating particles)
- Caustic water surface animation

**Key Methods:**
```javascript
createRoom()         // Build room geometry
createLighting()     // Set up light sources
createGodRays()      // Volumetric light beams
createParticles()    // Bubble/dust system
update(deltaTime)    // Animate effects
```

#### `CameraController.js` - Movement System
- Smooth first-person camera control
- Velocity-based movement with damping
- Boundary enforcement (keeps player in room)
- Subtle floating motion for immersion
- Support for both keyboard and gesture input

**Key Parameters:**
```javascript
moveSpeed: 3.0          // Units per second
rotateSpeed: 1.2        // Radians per second
dampingFactor: 0.85     // Smooth deceleration
```

**Tuning Tips:**
- Increase `moveSpeed` for faster swimming
- Decrease `dampingFactor` for more responsive controls
- Adjust `bounds` to change room size

#### `GestureController.js` - Hand Tracking
- MediaPipe Hands integration
- Gesture recognition with confidence thresholds
- Debouncing to prevent twitchy behavior
- Supports palm detection and fist detection

**Key Methods:**
```javascript
recognizeGesture()       // Identify hand pose
isHandOpen()            // Check finger extension
isPalmFacingCamera()    // Orientation detection
calculateConfidence()    // Stability scoring
```

**Gesture Tuning:**
```javascript
gestureThreshold: 0.7    // Lower = more sensitive
gestureDebounce: 300     // ms between detections
```

**To Adjust Sensitivity:**
- Edit `gestureThreshold` in `GestureController.js:25`
- Lower values (0.5) = more responsive but less accurate
- Higher values (0.9) = more accurate but requires clearer gestures

#### `Fish.js` - AI & Flocking
- Individual fish entities with boids algorithm
- Three flocking behaviors:
  - **Separation**: Avoid crowding
  - **Alignment**: Match neighbor velocities
  - **Cohesion**: Move toward group center
- Player reaction system
- Tail animation

**Flocking Parameters:**
```javascript
personalSpace: 1.5      // Separation distance
visionRange: 8          // Neighbor detection
avoidanceRange: 5       // Player detection
maxSpeed: 2-4           // Swimming speed (random)
```

**To Add More Fish:**
```javascript
// In main.js:93
this.fishSchool = new FishSchool(this.scene, 25); // Change from 15
```

**To Change Behavior:**
Edit weights in `Fish.js:178-182`:
```javascript
separation.multiplyScalar(1.5);   // Increase for more spacing
alignment.multiplyScalar(1.0);
cohesion.multiplyScalar(1.0);    // Increase for tighter schools
```

#### `TreasureChest.js` - Interactive Object
- Treasure chest with opening animation
- Teddy bear model with geometric primitives
- Floating animation when bear is revealed
- Glow effect for chest location

**Animation Speeds:**
```javascript
lidOpenSpeed: 2         // Chest opening speed
bearFloatSpeed: 1.5     // Upward movement
bearRotationSpeed: 0.5  // Spinning while floating
```

#### `MiniMap.js` - Top-Down Renderer
- Canvas 2D rendering
- Real-time position tracking
- Symbol rendering:
  - Player: Blue arrow with direction indicator
  - Treasure: Black square with gold outline
  - Fish: Small blue dots
  - Room: Grid lines and borders

---

## 🎨 Visual Customization

### Lighting

Edit `Environment.js:47-87`:

```javascript
// Ambient light intensity
this.lights.ambient = new THREE.AmbientLight(0x4488aa, 0.5);  // Color, intensity

// Sun light (from surface)
this.lights.sun = new THREE.DirectionalLight(0x88ccff, 1.5);  // Color, intensity
```

### Fog Density

Edit `main.js:60`:

```javascript
this.scene.fog = new THREE.FogExp2(0x0a4d68, 0.015);  // Color, density
```

- Lower density (0.01) = clearer water
- Higher density (0.03) = murkier water

### Particle Count

Edit `Environment.js:141`:

```javascript
const particleCount = 200;  // Increase for more particles
```

### Room Size

Edit `Environment.js:17`:

```javascript
this.roomSize = 50;  // Larger = more space to explore
```

Also update `CameraController.js:16` bounds accordingly.

---

## 🐛 Troubleshooting

### Webcam Not Working

**Issue**: Gesture recognition unavailable

**Solutions:**
1. Check browser permissions (camera access)
2. Try HTTPS or localhost (required for webcam access)
3. Ensure only one app is using the webcam
4. Disable gesture control using the UI toggle button

### Performance Issues

**Issue**: Low frame rate or stuttering

**Solutions:**
1. Reduce particle count in `Environment.js:141`
2. Reduce fish count in `main.js:93`
3. Lower shadow quality in `main.js:73`:
   ```javascript
   this.renderer.shadowMap.enabled = false;  // Disable shadows
   ```
4. Reduce pixel ratio in `main.js:70`:
   ```javascript
   this.renderer.setPixelRatio(1);  // Instead of Math.min(window.devicePixelRatio, 2)
   ```

### Gestures Not Detected

**Issue**: Hand tracking not recognizing gestures

**Solutions:**
1. Ensure good lighting in your environment
2. Show full hand to camera (palm facing forward)
3. Hold gesture steady for 300ms (debounce time)
4. Reduce `gestureThreshold` in `GestureController.js:25`
5. Check console for MediaPipe errors

### Treasure Chest Not Opening

**Issue**: Can't interact with chest

**Solutions:**
1. Get closer (must be within 8 units)
2. Try keyboard interaction (press E)
3. Check gesture is recognized (right fist)
4. Look at console for interaction logs

---

## ⚡ Performance Optimization Tips

### For Low-End Devices

1. **Reduce Shadow Quality**:
   ```javascript
   // main.js:73
   this.renderer.shadowMap.enabled = false;
   ```

2. **Simplify Fish Models**:
   ```javascript
   // Fish.js:46-50 - Reduce geometry segments
   const bodyGeometry = new THREE.SphereGeometry(this.size, 4, 4); // Lower values
   ```

3. **Reduce Particle Count**:
   ```javascript
   // Environment.js:141
   const particleCount = 100; // Half the default
   ```

4. **Disable Fog**:
   ```javascript
   // main.js:60
   // this.scene.fog = new THREE.FogExp2(0x0a4d68, 0.015); // Comment out
   ```

### For High-End Devices

1. **Increase Shadow Resolution**:
   ```javascript
   // Environment.js:64-65
   this.lights.sun.shadow.mapSize.width = 4096;
   this.lights.sun.shadow.mapSize.height = 4096;
   ```

2. **Add More Fish**:
   ```javascript
   // main.js:93
   this.fishSchool = new FishSchool(this.scene, 30);
   ```

3. **Increase Particle Count**:
   ```javascript
   // Environment.js:141
   const particleCount = 500;
   ```

---

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome 90+** | ✅ Full | Recommended |
| **Firefox 88+** | ✅ Full | Recommended |
| **Safari 14+** | ✅ Full | WebRTC gestures supported |
| **Edge 90+** | ✅ Full | Chromium-based |
| **Mobile Chrome** | ⚠️ Partial | No gesture control, keyboard only |
| **Mobile Safari** | ⚠️ Partial | No gesture control, limited touch |
| **IE 11** | ❌ None | Not supported |

---

## 📱 Mobile Support

The experience is **primarily designed for desktop** with webcam and keyboard/gesture controls.

**Mobile Limitations:**
- No gesture recognition (requires front-facing webcam API)
- Touch controls not implemented
- Reduced performance on older devices

**To Add Touch Controls:**

Add to `CameraController.js`:
```javascript
// Touch event listeners
canvas.addEventListener('touchstart', (e) => { /* Handle touch */ });
canvas.addEventListener('touchmove', (e) => { /* Handle drag */ });
```

---

## 🎓 Educational Use

This project demonstrates:

- **Three.js fundamentals**: Scene setup, lighting, materials, animation
- **AI/ML integration**: MediaPipe Hands for gesture recognition
- **Game AI**: Boids flocking algorithm implementation
- **Modular architecture**: ES6 modules and class-based design
- **Animation techniques**: Smooth interpolation, easing, state machines
- **Canvas 2D**: Mini-map rendering
- **UX design**: Calm, non-twitchy interactions

Perfect for learning:
- 3D web development
- Computer vision integration
- Flocking/steering behaviors
- Game state management

---

## 🛠️ Advanced Customization

### Adding New Gestures

Edit `GestureController.js:171-192`:

```javascript
// Add thumbs up detection
if (this.isThumbsUp(landmarks)) {
    return {
        type: 'thumbs_up',
        hand: handedness,
        confidence: confidence
    };
}
```

### Adding New Fish Behaviors

Edit `Fish.js`:

```javascript
// Add predator avoidance
avoidPredators(predators) {
    // Implementation
}

// In update loop
fish.avoidPredators(predatorArray);
```

### Custom Treasure Locations

Edit `main.js:209-220`:

```javascript
getRandomTreasurePosition() {
    // Place in specific corner
    return new THREE.Vector3(20, 0, 20);
}
```

---

## 📊 System Requirements

**Minimum:**
- CPU: Dual-core 2.0 GHz
- RAM: 4 GB
- GPU: Integrated graphics with WebGL support
- Browser: Chrome 90+, Firefox 88+, Safari 14+

**Recommended:**
- CPU: Quad-core 2.5 GHz
- RAM: 8 GB
- GPU: Dedicated graphics card
- Webcam: 720p or better for gesture recognition
- Browser: Latest Chrome or Firefox

---

## 📜 License

This project is open source and available for personal and educational use.

---

## 🙏 Acknowledgments

- **Three.js**: Amazing 3D library
- **MediaPipe**: Powerful ML hand tracking
- **Boids Algorithm**: Craig Reynolds' flocking simulation
- **Mood Board Inspiration**: Underwater installation art and projection experiences

---

## 📞 Support & Feedback

For questions, issues, or suggestions:
- Check the troubleshooting section above
- Review code comments in each module
- Experiment with parameters to customize the experience

---

**Dive in and find the teddy bear! 🧸🌊✨**

*Remember: This is an installation experience, not a game. Move slowly, breathe deeply, and enjoy the calm underwater atmosphere.*
