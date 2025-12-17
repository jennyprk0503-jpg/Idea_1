/**
 * ENVIRONMENT MODULE (Enhanced)
 *
 * Creates a whimsical, immersive underwater room with:
 * - Dramatic volumetric god rays
 * - Vibrant, colorful lighting
 * - Enchanted particle effects
 * - Animated caustics and water surface
 */

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.roomSize = 50;
        this.particles = [];
        this.godRays = [];
        this.lightOrbs = [];
        this.causticTime = 0;

        // References to scene objects
        this.room = null;
        this.lights = {
            ambient: null,
            sun: null,
            volumetric: []
        };
    }

    async init() {
        this.createRoom();
        this.createLighting();
        this.createCeiling();
        this.createEnhancedParticles();
        this.createDramaticGodRays();
        this.createLightOrbs();
    }

    /**
     * Creates the underwater room with enhanced materials
     */
    createRoom() {
        const size = this.roomSize;
        const wallHeight = 20;
        const wallThickness = 0.5;

        // Enhanced wall material with shimmer
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a4d68,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            shininess: 80,
            emissive: 0x0a2d48,
            emissiveIntensity: 0.2
        });

        // Enhanced floor with more detail
        const floorGeometry = new THREE.PlaneGeometry(size, size, 30, 30);
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x0a3d58,
            shininess: 60,
            emissive: 0x051d28,
            emissiveIntensity: 0.3
        });

        // Add more variation to floor vertices
        const floorPositions = floorGeometry.attributes.position;
        for (let i = 0; i < floorPositions.count; i++) {
            const x = floorPositions.getX(i);
            const y = floorPositions.getY(i);
            const variation = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.8;
            floorPositions.setZ(i, variation);
        }
        floorGeometry.computeVertexNormals();

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Create four walls
        const wallGeometry = new THREE.BoxGeometry(size, wallHeight, wallThickness);

        // North wall
        const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
        northWall.position.set(0, wallHeight / 2, -size / 2);
        this.scene.add(northWall);

        // South wall
        const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
        southWall.position.set(0, wallHeight / 2, size / 2);
        this.scene.add(southWall);

        // East wall
        const eastWall = new THREE.Mesh(wallGeometry.clone(), wallMaterial);
        eastWall.rotation.y = Math.PI / 2;
        eastWall.position.set(size / 2, wallHeight / 2, 0);
        this.scene.add(eastWall);

        // West wall
        const westWall = new THREE.Mesh(wallGeometry.clone(), wallMaterial);
        westWall.rotation.y = Math.PI / 2;
        westWall.position.set(-size / 2, wallHeight / 2, 0);
        this.scene.add(westWall);

        this.room = { floor, walls: [northWall, southWall, eastWall, westWall] };
    }

    /**
     * Creates enhanced lighting system with vibrant colors
     */
    createLighting() {
        // Brighter ambient underwater lighting with color
        this.lights.ambient = new THREE.AmbientLight(0x5599cc, 0.7); // Increased intensity
        this.scene.add(this.lights.ambient);

        // Main sun light with warmer color
        this.lights.sun = new THREE.DirectionalLight(0xaaddff, 2.5); // Much brighter!
        this.lights.sun.position.set(0, 20, 0);
        this.lights.sun.castShadow = true;

        // Enhanced shadow configuration
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 50;
        this.lights.sun.shadow.camera.left = -25;
        this.lights.sun.shadow.camera.right = 25;
        this.lights.sun.shadow.camera.top = 25;
        this.lights.sun.shadow.camera.bottom = -25;

        this.scene.add(this.lights.sun);

        // Multiple colored point lights for whimsical atmosphere
        const pointLightConfigs = [
            { color: 0x66ddff, intensity: 1.2, position: [10, 12, 10] },
            { color: 0x88ffaa, intensity: 1.0, position: [-10, 10, -10] },
            { color: 0xffaa88, intensity: 0.8, position: [15, 8, -15] },
            { color: 0xaa88ff, intensity: 0.9, position: [-15, 14, 15] },
            { color: 0xffdd66, intensity: 0.7, position: [0, 15, 0] }
        ];

        pointLightConfigs.forEach(config => {
            const light = new THREE.PointLight(config.color, config.intensity, 40);
            light.position.set(...config.position);
            this.scene.add(light);
            this.lights.volumetric.push(light);
        });
    }

    /**
     * Creates enhanced water surface with shimmer effect
     */
    createCeiling() {
        const size = this.roomSize;

        // Water surface with more segments for detail
        const surfaceGeometry = new THREE.PlaneGeometry(size * 0.7, size * 0.7, 50, 50);
        const surfaceMaterial = new THREE.MeshPhongMaterial({
            color: 0x66ccff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
            shininess: 120,
            emissive: 0x4499cc,
            emissiveIntensity: 0.5,
            specular: 0xffffff
        });

        // Create more complex initial wave pattern
        const positions = surfaceGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const wave = Math.sin(x * 0.3) * 0.4 + Math.cos(y * 0.3) * 0.4;
            positions.setZ(i, wave);
        }
        surfaceGeometry.computeVertexNormals();

        const waterSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        waterSurface.rotation.x = -Math.PI / 2;
        waterSurface.position.y = 19;
        this.scene.add(waterSurface);

        this.waterSurface = waterSurface;
    }

    /**
     * Creates colorful, magical particle system
     */
    createEnhancedParticles() {
        const particleCount = 300; // Increased from 200
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];
        const sizes = [];

        // Color palette for whimsical particles
        const colorPalette = [
            new THREE.Color(0x88ddff), // Cyan
            new THREE.Color(0xffaa88), // Coral
            new THREE.Color(0xaaffdd), // Mint
            new THREE.Color(0xffddaa), // Peach
            new THREE.Color(0xdd88ff), // Purple
            new THREE.Color(0xffff88)  // Yellow
        ];

        for (let i = 0; i < particleCount; i++) {
            // Random position
            positions.push(
                (Math.random() - 0.5) * this.roomSize * 0.8,
                Math.random() * 18,
                (Math.random() - 0.5) * this.roomSize * 0.8
            );

            // Colorful particles
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors.push(color.r, color.g, color.b);

            // Upward velocity
            velocities.push(
                (Math.random() - 0.5) * 0.03,
                Math.random() * 0.06 + 0.03,
                (Math.random() - 0.5) * 0.03
            );

            // Varied sizes
            sizes.push(Math.random() * 0.5 + 0.2);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    /**
     * Creates dramatic, more numerous god rays
     */
    createDramaticGodRays() {
        const rayCount = 12; // Increased from 5

        for (let i = 0; i < rayCount; i++) {
            const geometry = new THREE.ConeGeometry(
                2 + Math.random() * 3,  // Varied radius
                22,                      // Longer rays
                8,
                1,
                true
            );

            // More vibrant ray colors
            const colors = [0x88ddff, 0xaaffee, 0x99ccff, 0xbbddff, 0xccffff];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.15, // Slightly more visible
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const ray = new THREE.Mesh(geometry, material);
            ray.position.set(
                (Math.random() - 0.5) * 18,
                19,
                (Math.random() - 0.5) * 18
            );
            ray.rotation.x = Math.PI;

            // Animation parameters
            ray.userData = {
                initialRotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                pulseSpeed: Math.random() * 2 + 1,
                pulseOffset: Math.random() * Math.PI * 2
            };

            this.scene.add(ray);
            this.godRays.push(ray);
        }
    }

    /**
     * Creates floating light orbs for magical atmosphere
     */
    createLightOrbs() {
        const orbCount = 8;

        for (let i = 0; i < orbCount; i++) {
            const geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 16, 16);

            // Vibrant emissive colors
            const colors = [0x88ddff, 0xff88dd, 0xddff88, 0x88ffdd, 0xffdd88];
            const color = colors[i % colors.length];

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });

            const orb = new THREE.Mesh(geometry, material);

            // Random position
            orb.position.set(
                (Math.random() - 0.5) * 35,
                Math.random() * 15 + 3,
                (Math.random() - 0.5) * 35
            );

            // Movement parameters
            orb.userData = {
                initialPos: orb.position.clone(),
                floatSpeed: Math.random() * 0.5 + 0.5,
                floatRadius: Math.random() * 2 + 1,
                floatOffset: Math.random() * Math.PI * 2
            };

            this.scene.add(orb);
            this.lightOrbs.push(orb);
        }
    }

    /**
     * Update function with enhanced animations
     */
    update(deltaTime) {
        this.causticTime += deltaTime;

        // Animate water surface with more complex waves
        if (this.waterSurface) {
            const positions = this.waterSurface.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);

                // Multi-layered wave effect
                const wave1 = Math.sin(x * 0.5 + this.causticTime * 2) * 0.4;
                const wave2 = Math.cos(y * 0.5 + this.causticTime * 1.5) * 0.4;
                const wave3 = Math.sin((x + y) * 0.3 + this.causticTime * 2.5) * 0.2;

                positions.setZ(i, wave1 + wave2 + wave3);
            }
            positions.needsUpdate = true;
            this.waterSurface.geometry.computeVertexNormals();

            // Pulse emissive intensity
            this.waterSurface.material.emissiveIntensity =
                0.4 + Math.sin(this.causticTime * 2) * 0.2;
        }

        // Animate particles
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position;
            const velocities = this.particleSystem.geometry.attributes.velocity;

            for (let i = 0; i < positions.count; i++) {
                let x = positions.getX(i);
                let y = positions.getY(i);
                let z = positions.getZ(i);

                const vx = velocities.getX(i);
                const vy = velocities.getY(i);
                const vz = velocities.getZ(i);

                // Add swirl motion
                const swirlX = Math.cos(this.causticTime + i) * 0.02;
                const swirlZ = Math.sin(this.causticTime + i) * 0.02;

                x += vx + swirlX;
                y += vy;
                z += vz + swirlZ;

                // Reset particles that reach the top
                if (y > 19) {
                    y = 0;
                    x = (Math.random() - 0.5) * this.roomSize * 0.8;
                    z = (Math.random() - 0.5) * this.roomSize * 0.8;
                }

                positions.setXYZ(i, x, y, z);
            }

            positions.needsUpdate = true;
        }

        // Animate god rays with more dramatic movement
        this.godRays.forEach(ray => {
            const userData = ray.userData;

            // Rotation
            ray.rotation.y = userData.initialRotation +
                            Math.sin(this.causticTime * userData.rotationSpeed) * 0.5;

            // Pulsing opacity
            const pulse = Math.sin(this.causticTime * userData.pulseSpeed + userData.pulseOffset);
            ray.material.opacity = 0.08 + pulse * 0.08;

            // Subtle scale animation
            const scale = 1 + Math.sin(this.causticTime * userData.pulseSpeed) * 0.1;
            ray.scale.set(scale, 1, scale);
        });

        // Animate light orbs floating
        this.lightOrbs.forEach((orb, index) => {
            const userData = orb.userData;
            const time = this.causticTime * userData.floatSpeed + userData.floatOffset;

            orb.position.x = userData.initialPos.x + Math.sin(time) * userData.floatRadius;
            orb.position.y = userData.initialPos.y + Math.cos(time * 0.5) * userData.floatRadius * 0.5;
            orb.position.z = userData.initialPos.z + Math.cos(time) * userData.floatRadius;

            // Pulse opacity
            orb.material.opacity = 0.4 + Math.sin(this.causticTime * 2 + index) * 0.3;
        });

        // Animate sun light for caustic effect with more movement
        if (this.lights.sun) {
            this.lights.sun.position.x = Math.sin(this.causticTime * 0.5) * 3;
            this.lights.sun.position.z = Math.cos(this.causticTime * 0.5) * 3;

            // Pulse intensity slightly
            this.lights.sun.intensity = 2.3 + Math.sin(this.causticTime) * 0.3;
        }

        // Animate point lights subtly
        this.lights.volumetric.forEach((light, index) => {
            const baseIntensity = [1.2, 1.0, 0.8, 0.9, 0.7][index];
            light.intensity = baseIntensity + Math.sin(this.causticTime * 2 + index) * 0.2;
        });
    }
}
