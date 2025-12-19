/**
 * UNDERWATER EXPLORATION - Main Entry Point (Enhanced)
 *
 * This file coordinates all subsystems and manages the application lifecycle.
 * Features enhanced post-processing with bloom and whimsical lighting effects.
 */

import { Environment } from './Environment.js';
import { CameraController } from './CameraController.js';
import { GestureController } from './GestureController.js';
import { FishSchool } from './Fish.js';
import { TreasureChest } from './TreasureChest.js';
import { MiniMap } from './MiniMap.js';

class UnderwaterExploration {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null; // Post-processing composer

        // Subsystems
        this.environment = null;
        this.cameraController = null;
        this.gestureController = null;
        this.fishSchool = null;
        this.treasureChest = null;
        this.miniMap = null;

        // State
        this.isLoaded = false;
        this.isStarted = false;
        this.gesturesEnabled = true;
        this.minimapEnabled = true;
        this.musicEnabled = true;

        // Background music
        this.backgroundMusic = document.getElementById('background-music');
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 0.3; // Set comfortable volume
        }

        // UI Elements
        this.ui = {
            loadingScreen: document.getElementById('loading-screen'),
            loadingProgress: document.getElementById('loading-progress'),
            loadingStatus: document.getElementById('loading-status'),
            startBtn: document.getElementById('start-btn'),
            gestureStatus: document.getElementById('gesture-status'),
            cameraStatus: document.getElementById('camera-status'),
            interactionPrompt: document.getElementById('interaction-prompt'),
            treasureMessage: document.getElementById('treasure-message'),
            controlsHelp: document.getElementById('controls-help'),
        };

        this.init();
    }

    async init() {
        console.log('🌊 Initializing Enhanced Underwater Exploration...');

        this.setupThreeJS();
        this.setupPostProcessing();
        await this.loadResources();
        this.setupEventListeners();
        this.setupUI();

        // Start animation loop
        this.animate();

        console.log('✅ Initialization complete');
    }

    setupThreeJS() {
        this.updateLoadingStatus('Setting up 3D scene...', 10);

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x1a3d5c, 0.012); // Lighter, more atmospheric fog

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 0);

        // Create renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // High quality soft shadows

        // Enhanced tone mapping for more vibrant colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 2.2; // Much brighter for underwater visibility

        // Enable physically correct lighting
        this.renderer.physicallyCorrectLights = true;

        // Color management
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Setup post-processing effects for magical, whimsical atmosphere
     * Falls back to regular rendering if post-processing is unavailable
     */
    setupPostProcessing() {
        this.updateLoadingStatus('Adding magical effects...', 15);

        try {
            // Check if post-processing classes are available
            if (typeof THREE.EffectComposer === 'undefined' ||
                typeof THREE.RenderPass === 'undefined' ||
                typeof THREE.UnrealBloomPass === 'undefined') {
                console.warn('⚠️ Post-processing not available, using standard rendering');
                this.composer = null;
                return;
            }

            // Create effect composer
            this.composer = new THREE.EffectComposer(this.renderer);

            // Add render pass
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            // Add bloom pass for magical glow
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5,    // strength - increased for more glow
                0.6,    // radius - medium spread
                0.3     // threshold - what brightnesses glow
            );
            this.composer.addPass(bloomPass);
            this.bloomPass = bloomPass; // Store reference for later adjustment

            console.log('✨ Post-processing enabled with bloom effects');
        } catch (error) {
            console.warn('⚠️ Post-processing setup failed, falling back to standard rendering:', error);
            this.composer = null;
        }
    }

    async loadResources() {
        this.updateLoadingStatus('Building underwater environment...', 30);

        // Create enhanced environment
        this.environment = new Environment(this.scene);
        await this.environment.init();

        this.updateLoadingStatus('Spawning fish...', 50);

        // Create fish school with more fish for fuller scene
        this.fishSchool = new FishSchool(this.scene, 40); // Doubled to 40 for more vibrant underwater life

        this.updateLoadingStatus('Hiding treasure...', 60);

        // Create treasure chest at random location
        const treasurePos = this.getRandomTreasurePosition();
        this.treasureChest = new TreasureChest(this.scene, treasurePos);

        this.updateLoadingStatus('Setting up camera controls...', 70);

        // Create camera controller
        this.cameraController = new CameraController(this.camera, this.scene);

        this.updateLoadingStatus('Initializing gesture recognition...', 80);

        // Create gesture controller
        this.gestureController = new GestureController(
            (status) => this.onGestureStatusChange(status),
            (gesture) => this.onGestureDetected(gesture)
        );
        await this.gestureController.init();

        this.updateLoadingStatus('Creating mini-map...', 90);

        // Create mini-map
        this.miniMap = new MiniMap(
            this.camera,
            this.fishSchool,
            this.treasureChest,
            this.environment.roomSize
        );

        this.updateLoadingStatus('Ready to explore!', 100);

        // Show start button
        this.ui.startBtn.classList.remove('hidden');
        this.isLoaded = true;
    }

    setupEventListeners() {
        // Start button
        this.ui.startBtn.addEventListener('click', () => this.start());

        // Keyboard controls
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Settings buttons
        document.getElementById('toggle-music').addEventListener('click', () => {
            this.musicEnabled = !this.musicEnabled;
            document.getElementById('music-toggle-text').textContent =
                this.musicEnabled ? 'ON' : 'OFF';
            document.getElementById('music-icon').textContent =
                this.musicEnabled ? '🎵' : '🔇';

            if (this.backgroundMusic) {
                if (this.musicEnabled) {
                    this.backgroundMusic.play().catch(err => console.log('Music playback prevented:', err));
                } else {
                    this.backgroundMusic.pause();
                }
            }
        });

        document.getElementById('toggle-gestures').addEventListener('click', () => {
            this.gesturesEnabled = !this.gesturesEnabled;
            document.getElementById('gesture-toggle-text').textContent =
                this.gesturesEnabled ? 'ON' : 'OFF';
            this.gestureController.setEnabled(this.gesturesEnabled);
        });

        document.getElementById('toggle-minimap').addEventListener('click', () => {
            this.minimapEnabled = !this.minimapEnabled;
            document.getElementById('minimap-toggle-text').textContent =
                this.minimapEnabled ? 'ON' : 'OFF';
            document.getElementById('minimap-container').classList.toggle('hidden');
        });

        document.getElementById('toggle-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('toggle-help').addEventListener('click', () => {
            this.ui.controlsHelp.classList.toggle('hidden');
        });
    }

    setupUI() {
        // Initially hide some UI elements
        this.ui.interactionPrompt.style.opacity = '0';
    }

    start() {
        if (!this.isLoaded || this.isStarted) return;

        console.log('🏊 Starting exploration...');
        this.isStarted = true;

        // Hide loading screen
        this.ui.loadingScreen.classList.add('hidden');

        // Start background music
        if (this.musicEnabled && this.backgroundMusic) {
            this.backgroundMusic.play().catch(err => {
                console.log('Music autoplay prevented. User can enable via button.', err);
                // Update UI to show music is off if autoplay failed
                this.musicEnabled = false;
                document.getElementById('music-toggle-text').textContent = 'OFF';
                document.getElementById('music-icon').textContent = '🔇';
            });
        }

        // Start gesture controller
        if (this.gesturesEnabled) {
            this.gestureController.start();
        }
    }

    onKeyDown(event) {
        if (!this.isStarted) return;

        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.cameraController.moveForward();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.cameraController.rotateLeft();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.cameraController.rotateRight();
                break;
        }
    }

    onGestureStatusChange(status) {
        this.ui.gestureStatus.textContent = status;
    }

    onGestureDetected(gesture) {
        if (!this.isStarted || !this.gesturesEnabled) return;

        switch (gesture.type) {
            case 'both_palms':
                // Both palms shown - attempt to open treasure chest
                this.attemptChestInteraction();
                break;
        }
    }

    attemptChestInteraction() {
        if (!this.treasureChest || this.treasureChest.isOpen) return;

        // Check if camera is in the right range (close but not on top)
        const distance = this.camera.position.distanceTo(this.treasureChest.position);

        if (distance >= 3 && distance < 8) {
            // Perfect range - open chest!
            this.openTreasureChest();
        } else if (distance < 3) {
            this.showInteractionPrompt('Too close! Step back a bit and show both palms!', 2000);
        } else {
            this.showInteractionPrompt('Move closer to the treasure chest!', 2000);
        }
    }

    openTreasureChest() {
        console.log('🎁 Opening treasure chest!');

        this.treasureChest.open();

        // Show treasure message after a short delay
        setTimeout(() => {
            this.ui.treasureMessage.classList.remove('hidden');
        }, 1500);
    }

    showInteractionPrompt(text, duration = 2000) {
        this.ui.interactionPrompt.textContent = text;
        this.ui.interactionPrompt.classList.add('visible');

        setTimeout(() => {
            this.ui.interactionPrompt.classList.remove('visible');
        }, duration);
    }

    getRandomTreasurePosition() {
        // Place treasure somewhere in the room, but not too close to start position
        const roomSize = 50;
        const minDistanceFromStart = 15;
        const minDistanceFromFurniture = 5; // Minimum distance from any furniture
        const treasureRadius = 2; // Approximate size of treasure chest

        // Get furniture collision data
        const furnitureData = this.environment.getFurnitureCollisionData();

        let x, z, position;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            x = (Math.random() - 0.5) * (roomSize - 10);
            z = (Math.random() - 0.5) * (roomSize - 10);
            position = new THREE.Vector3(x, 0, z);
            attempts++;

            // Check distance from start position
            const distanceFromStart = Math.sqrt(x * x + z * z);
            if (distanceFromStart < minDistanceFromStart) {
                continue;
            }

            // Check distance from all furniture
            let tooCloseToFurniture = false;
            for (const furniture of furnitureData) {
                const distance = position.distanceTo(furniture.position);
                if (distance < (furniture.radius + treasureRadius + minDistanceFromFurniture)) {
                    tooCloseToFurniture = true;
                    break;
                }
            }

            // If we found a good spot, break out
            if (!tooCloseToFurniture) {
                break;
            }

            // Prevent infinite loop
            if (attempts >= maxAttempts) {
                console.warn('Could not find ideal treasure position after', maxAttempts, 'attempts. Using best attempt.');
                break;
            }

        } while (true);

        return position;
    }

    updateLoadingStatus(message, progress) {
        if (this.ui.loadingStatus) {
            this.ui.loadingStatus.textContent = message;
        }
        if (this.ui.loadingProgress) {
            this.ui.loadingProgress.style.width = `${progress}%`;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.getElementById('app').requestFullscreen().catch(err => {
                console.error('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    update(deltaTime) {
        if (!this.isStarted) return;

        // Handle continuous gesture controls
        if (this.gesturesEnabled && this.gestureController) {
            const gestures = this.gestureController.getCurrentGestures();

            // Continuous rotation based on palm gestures
            if (gestures.leftHand?.type === 'palm_left') {
                // Left palm → rotate right (camera turns to face right)
                this.cameraController.rotateRight(1.0);
            }
            if (gestures.rightHand?.type === 'palm_right') {
                // Right palm → rotate left (camera turns to face left)
                this.cameraController.rotateLeft(1.0);
            }

            // Continuous forward movement based on fist gestures
            if (gestures.leftHand?.type === 'fist_left' || gestures.rightHand?.type === 'fist_right') {
                // Either hand showing fist → move forward
                this.cameraController.moveForward();
            }
        }

        // Update subsystems
        if (this.environment) {
            this.environment.update(deltaTime);
        }

        if (this.cameraController) {
            this.cameraController.update(deltaTime);
        }

        if (this.fishSchool) {
            this.fishSchool.update(deltaTime, this.camera.position);
        }

        if (this.treasureChest) {
            this.treasureChest.update(deltaTime);
        }

        if (this.miniMap && this.minimapEnabled) {
            this.miniMap.update();
        }

        // Check proximity to treasure and update visual feedback
        if (this.treasureChest && !this.treasureChest.isOpen) {
            const distance = this.camera.position.distanceTo(this.treasureChest.position);

            // Update proximity visual feedback
            this.treasureChest.updateProximity(distance);

            // Show instructions based on distance
            if (distance >= 3 && distance < 8) {
                // In perfect range - show palm gesture instruction
                this.showInteractionPrompt('Show BOTH palms to open the treasure!', 100);
            } else if (distance < 3) {
                // Too close
                this.showInteractionPrompt('Too close! Step back a bit!', 100);
            } else if (distance < 12) {
                // Getting close
                this.showInteractionPrompt('Getting closer...', 100);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = 1 / 60; // Approximate 60 FPS

        this.update(deltaTime);

        // Use post-processing composer instead of direct rendering
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UnderwaterExploration();
    });
} else {
    new UnderwaterExploration();
}
