/**
 * UNDERWATER EXPLORATION - Main Entry Point
 *
 * This file coordinates all subsystems and manages the application lifecycle.
 * It handles scene initialization, loading, and the main animation loop.
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
        console.log('🌊 Initializing Underwater Exploration...');

        this.setupThreeJS();
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
        this.scene.fog = new THREE.FogExp2(0x0a4d68, 0.015); // Underwater fog

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    async loadResources() {
        this.updateLoadingStatus('Building underwater environment...', 30);

        // Create environment (room, lighting, particles)
        this.environment = new Environment(this.scene);
        await this.environment.init();

        this.updateLoadingStatus('Spawning fish...', 50);

        // Create fish school
        this.fishSchool = new FishSchool(this.scene, 15); // Start with 15 fish

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
            case 'KeyE':
                // Interact with chest if nearby
                this.attemptChestInteraction();
                break;
        }
    }

    onGestureStatusChange(status) {
        this.ui.gestureStatus.textContent = status;
    }

    onGestureDetected(gesture) {
        if (!this.isStarted || !this.gesturesEnabled) return;

        switch (gesture.type) {
            case 'palm_left':
                this.cameraController.rotateLeft(gesture.confidence);
                break;
            case 'palm_right':
                this.cameraController.rotateRight(gesture.confidence);
                break;
            case 'fist_right':
                this.attemptChestInteraction();
                break;
        }
    }

    attemptChestInteraction() {
        if (!this.treasureChest || this.treasureChest.isOpen) return;

        // Check if camera is close enough to chest
        const distance = this.camera.position.distanceTo(this.treasureChest.position);

        if (distance < 8) {
            this.openTreasureChest();
        } else {
            this.showInteractionPrompt('Move closer to the treasure chest!');
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
        const minDistance = 15;

        let x, z;
        do {
            x = (Math.random() - 0.5) * (roomSize - 10);
            z = (Math.random() - 0.5) * (roomSize - 10);
        } while (Math.sqrt(x * x + z * z) < minDistance);

        return new THREE.Vector3(x, 0, z);
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

        // Check proximity to treasure
        if (this.treasureChest && !this.treasureChest.isOpen) {
            const distance = this.camera.position.distanceTo(this.treasureChest.position);
            if (distance < 8) {
                this.showInteractionPrompt('Right fist gesture or press E to open chest!', 100);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = 1 / 60; // Approximate 60 FPS

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
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
