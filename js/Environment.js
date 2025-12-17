/**
 * ENVIRONMENT MODULE
 *
 * Handles the underwater room, lighting, particle systems, and atmospheric effects.
 * Creates the dream-like, installation-style aesthetic with caustics and god rays.
 */

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.roomSize = 50;
        this.particles = [];
        this.godRays = [];
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
        this.createParticles();
        this.createGodRays();
    }

    /**
     * Creates the underwater room with walls and floor
     */
    createRoom() {
        const size = this.roomSize;
        const wallHeight = 20;
        const wallThickness = 0.5;

        // Material for walls - semi-transparent blue-green
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x0a4d68,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            shininess: 60
        });

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(size, size, 20, 20);
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x0a3d58,
            shininess: 40
        });

        // Add some variation to floor vertices for natural look
        const floorPositions = floorGeometry.attributes.position;
        for (let i = 0; i < floorPositions.count; i++) {
            const z = floorPositions.getZ(i);
            floorPositions.setZ(i, z + (Math.random() - 0.5) * 0.5);
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
     * Creates lighting system with volumetric sun rays
     */
    createLighting() {
        // Ambient underwater lighting
        this.lights.ambient = new THREE.AmbientLight(0x4488aa, 0.5);
        this.scene.add(this.lights.ambient);

        // Main sun light from above (through water surface opening)
        this.lights.sun = new THREE.DirectionalLight(0x88ccff, 1.5);
        this.lights.sun.position.set(0, 20, 0);
        this.lights.sun.castShadow = true;

        // Configure shadow properties
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 50;
        this.lights.sun.shadow.camera.left = -25;
        this.lights.sun.shadow.camera.right = 25;
        this.lights.sun.shadow.camera.top = 25;
        this.lights.sun.shadow.camera.bottom = -25;

        this.scene.add(this.lights.sun);

        // Additional point lights for ambiance
        const pointLight1 = new THREE.PointLight(0x66bbff, 0.5, 30);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x66bbff, 0.5, 30);
        pointLight2.position.set(-10, 10, -10);
        this.scene.add(pointLight2);
    }

    /**
     * Creates the ceiling/water surface opening where light enters
     */
    createCeiling() {
        const size = this.roomSize;

        // Water surface plane with caustic shader
        const surfaceGeometry = new THREE.PlaneGeometry(size * 0.6, size * 0.6, 30, 30);
        const surfaceMaterial = new THREE.MeshPhongMaterial({
            color: 0x4499cc,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            shininess: 100,
            emissive: 0x224466,
            emissiveIntensity: 0.3
        });

        // Animate water surface vertices
        const positions = surfaceGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            positions.setZ(i, Math.sin(i * 0.5) * 0.3);
        }
        surfaceGeometry.computeVertexNormals();

        const waterSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        waterSurface.rotation.x = -Math.PI / 2;
        waterSurface.position.y = 19;
        this.scene.add(waterSurface);

        this.waterSurface = waterSurface;
    }

    /**
     * Creates floating particle system (bubbles, dust)
     */
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        const sizes = [];

        for (let i = 0; i < particleCount; i++) {
            // Random position within room
            positions.push(
                (Math.random() - 0.5) * this.roomSize * 0.8,
                Math.random() * 18,
                (Math.random() - 0.5) * this.roomSize * 0.8
            );

            // Upward velocity with slight horizontal drift
            velocities.push(
                (Math.random() - 0.5) * 0.02,
                Math.random() * 0.05 + 0.02,
                (Math.random() - 0.5) * 0.02
            );

            // Random sizes
            sizes.push(Math.random() * 0.3 + 0.1);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            color: 0xaaccff,
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    /**
     * Creates volumetric god rays using cone meshes
     */
    createGodRays() {
        const rayCount = 5;

        for (let i = 0; i < rayCount; i++) {
            const geometry = new THREE.ConeGeometry(
                3 + Math.random() * 2, // radius
                20, // height
                8, // radial segments
                1,
                true // open ended
            );

            const material = new THREE.MeshBasicMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const ray = new THREE.Mesh(geometry, material);
            ray.position.set(
                (Math.random() - 0.5) * 15,
                19,
                (Math.random() - 0.5) * 15
            );
            ray.rotation.x = Math.PI;

            // Store initial rotation for animation
            ray.userData = {
                initialRotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            };

            this.scene.add(ray);
            this.godRays.push(ray);
        }
    }

    /**
     * Update function called each frame
     */
    update(deltaTime) {
        this.causticTime += deltaTime;

        // Animate water surface
        if (this.waterSurface) {
            const positions = this.waterSurface.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const wave = Math.sin(x * 0.5 + this.causticTime * 2) * 0.3 +
                            Math.cos(y * 0.5 + this.causticTime * 1.5) * 0.3;
                positions.setZ(i, wave);
            }
            positions.needsUpdate = true;
            this.waterSurface.geometry.computeVertexNormals();
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

                x += vx;
                y += vy;
                z += vz;

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

        // Animate god rays
        this.godRays.forEach(ray => {
            ray.rotation.y = ray.userData.initialRotation +
                            Math.sin(this.causticTime + ray.userData.initialRotation) * 0.2;

            // Pulse opacity
            ray.material.opacity = 0.05 + Math.sin(this.causticTime * 2 + ray.userData.initialRotation) * 0.05;
        });

        // Animate sun light for caustic effect
        if (this.lights.sun) {
            this.lights.sun.position.x = Math.sin(this.causticTime * 0.5) * 2;
            this.lights.sun.position.z = Math.cos(this.causticTime * 0.5) * 2;
        }
    }
}
