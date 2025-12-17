# 🌊 Interactive Underwater Experience

An immersive, interactive underwater environment built with HTML5 Canvas and JavaScript. Dive into a beautiful ocean scene with animated fish, bubbles, light rays, and interactive elements.

![Underwater Experience](https://img.shields.io/badge/Status-Live-blue) ![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

### 🐟 Realistic Fish Behavior
- **Intelligent Movement**: Fish swim with realistic physics and fluid motion
- **Unique Personalities**: Each fish has individual traits (shyness, curiosity, schooling behavior)
- **Mouse Interaction**: Fish react to your cursor - some flee, others approach
- **Dynamic Animation**: Animated tails, fins, and natural swimming patterns
- **Colorful Variety**: Random colors and sizes for visual diversity

### 💧 Particle Effects
- **Bubbles**: Rising bubbles with wobble animation and realistic physics
- **Ripples**: Click anywhere to create expanding ripple effects
- **Caustic Lighting**: Animated underwater light patterns
- **Ambient Particles**: Continuous bubble generation from the ocean floor

### 🎮 Interactive Controls
- **Mouse Tracking**: Move your mouse to attract or repel fish
- **Click Interactions**: Create ripples and bubble bursts
- **Add Fish**: Dynamically add more fish to the scene
- **Sound Toggle**: Enable/disable ambient ocean sounds
- **Fullscreen Mode**: Immerse yourself completely

### 🎨 Visual Effects
- **Gradient Background**: Deep ocean color gradient
- **Light Rays**: Animated sunlight rays from the surface
- **Smooth Animations**: 60 FPS rendering with requestAnimationFrame
- **Responsive Design**: Adapts to any screen size

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or dependencies required!

### Running the Experience

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Click "Enter the Ocean"** to start the experience

Alternatively, you can run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (with npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## 🎯 How to Interact

### Mouse Controls
- **Move Mouse**: Fish will react to your cursor based on their personality
- **Click**: Creates ripple effects and bubble bursts

### Keyboard Shortcuts
- **Space**: Add 3 new fish to the scene
- **F**: Toggle fullscreen mode

### UI Buttons
- **🔊 Sound**: Toggle ambient ocean sounds
- **⛶ Fullscreen**: Enter/exit fullscreen mode
- **🐟 Add Fish**: Add 5 new fish to the scene
- **Fish Counter**: Shows current number of fish

## 🎨 Customization

You can easily customize the experience by modifying these parameters in `script.js`:

### Fish Behavior
```javascript
// In the Fish class constructor
this.size = Math.random() * 20 + 15;  // Fish size range
this.speedX = Math.random() * 2 - 1;  // Swimming speed
this.hue = Math.random() * 60 + 10;   // Color range (orange-yellow)
```

### Initial Fish Count
```javascript
// In UnderwaterExperience constructor
this.initializeFish(20);  // Change starting number of fish
```

### Bubble Frequency
```javascript
// In the update() method
if (Math.random() < 0.05) {  // Adjust probability (0.05 = 5% chance per frame)
    // Add bubble
}
```

### Background Colors
```css
/* In style.css */
#underwater-container {
    background: radial-gradient(ellipse at center top, #0a4d68 0%, #001a33 100%);
}
```

## 📁 Project Structure

```
underwater-experience/
│
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Core JavaScript logic
└── README.md          # Documentation
```

## 🔧 Technical Details

### Classes

#### `UnderwaterExperience`
Main application class that manages:
- Canvas setup and rendering
- Fish, bubble, and particle arrays
- Event listeners
- Animation loop
- User interactions

#### `Fish`
Represents individual fish with:
- Position and velocity
- Size and color
- Personality traits (shyness, curiosity)
- Tail animation
- Mouse interaction logic
- Drawing logic with body, tail, fins, and eyes

#### `Bubble`
Bubble particles that:
- Rise from bottom or click points
- Wobble as they ascend
- Have realistic gradients and highlights
- Fade out over time

#### `Particle`
Ripple effect particles that:
- Expand from click points
- Fade and slow down over time
- Create visual feedback for interactions

### Performance
- Uses `requestAnimationFrame` for smooth 60 FPS
- Efficient particle management with array filtering
- Canvas clearing and redrawing optimized
- Handles hundreds of elements simultaneously

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)
- ⚠️ Internet Explorer (not supported)

## 🎨 Inspiration

This project was inspired by:
- Natural underwater environments
- Interactive art installations
- Projection mapping experiences
- Relaxing aquarium ambiance

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Different types of sea creatures (jellyfish, sharks, etc.)
- Coral and seaweed animations
- Day/night cycle
- Different ocean biomes
- Predator/prey interactions
- Sound effects for interactions
- Mobile touch support enhancements

## 📝 License

This project is open source and available for personal and educational use.

## 🎯 Future Enhancements

Potential features to add:
- [ ] Multiple species of marine life
- [ ] Coral reef and plant life
- [ ] Schools of fish (flocking behavior)
- [ ] Predators and prey dynamics
- [ ] Different ocean depths/zones
- [ ] Time of day variations
- [ ] Save/load custom scenes
- [ ] VR support
- [ ] Mobile touch gestures
- [ ] Multiplayer/shared experiences

## 👨‍💻 Development

Built with vanilla JavaScript - no frameworks or libraries required!

Technologies used:
- HTML5 Canvas API
- JavaScript ES6+
- CSS3 Animations
- Web Audio API (for sound)

## 🙏 Acknowledgments

Special thanks to the inspiration images that guided this project's vision of creating an immersive underwater projection experience.

---

**Enjoy your underwater journey! 🐠🌊✨**

For questions or feedback, feel free to open an issue or contribute to the project.
