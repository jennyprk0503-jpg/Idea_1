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
        this.createFurniture(); // Add furniture for submerged room aesthetic
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

        // Enhanced floor with more detail and reflectivity
        const floorGeometry = new THREE.PlaneGeometry(size, size, 30, 30);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a5d78,
            metalness: 0.3,
            roughness: 0.4,
            envMapIntensity: 1.0,
            emissive: 0x0a2d48,
            emissiveIntensity: 0.2
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
        // Much brighter ambient underwater lighting
        this.lights.ambient = new THREE.AmbientLight(0x88bbee, 1.2); // Significantly increased
        this.scene.add(this.lights.ambient);

        // Main sun light with brighter, more natural color
        this.lights.sun = new THREE.DirectionalLight(0xffffff, 3.5); // Much brighter white light
        this.lights.sun.position.set(0, 20, 0);
        this.lights.sun.castShadow = true;

        // Enhanced shadow configuration for better quality
        this.lights.sun.shadow.mapSize.width = 4096; // Higher resolution shadows
        this.lights.sun.shadow.mapSize.height = 4096;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 50;
        this.lights.sun.shadow.camera.left = -30;
        this.lights.sun.shadow.camera.right = 30;
        this.lights.sun.shadow.camera.top = 30;
        this.lights.sun.shadow.camera.bottom = -30;
        this.lights.sun.shadow.bias = -0.0001; // Reduce shadow acne

        this.scene.add(this.lights.sun);

        // Multiple colored point lights for whimsical atmosphere - increased brightness
        const pointLightConfigs = [
            { color: 0x66ddff, intensity: 2.0, position: [10, 12, 10] },
            { color: 0x88ffaa, intensity: 1.8, position: [-10, 10, -10] },
            { color: 0xffaa88, intensity: 1.5, position: [15, 8, -15] },
            { color: 0xaa88ff, intensity: 1.6, position: [-15, 14, 15] },
            { color: 0xffdd66, intensity: 1.4, position: [0, 15, 0] }
        ];

        pointLightConfigs.forEach(config => {
            const light = new THREE.PointLight(config.color, config.intensity, 40);
            light.position.set(...config.position);
            this.scene.add(light);
            this.lights.volumetric.push(light);
        });

        // Additional overhead spotlights for dramatic effect - much brighter
        const spotlightConfigs = [
            { color: 0xffffff, intensity: 4.5, position: [8, 18, 8], angle: Math.PI / 5 },
            { color: 0xeeffff, intensity: 4.0, position: [-8, 18, -8], angle: Math.PI / 5 },
            { color: 0xffffff, intensity: 3.8, position: [12, 18, -10], angle: Math.PI / 5.5 },
            { color: 0xf0ffff, intensity: 4.2, position: [-10, 18, 12], angle: Math.PI / 5.5 }
        ];

        this.overheadSpotlights = [];
        spotlightConfigs.forEach(config => {
            const spotlight = new THREE.SpotLight(config.color, config.intensity, 30, config.angle, 0.5);
            spotlight.position.set(...config.position);
            spotlight.target.position.set(config.position[0] * 0.3, 0, config.position[2] * 0.3);
            spotlight.castShadow = false; // Disable shadows for performance

            this.scene.add(spotlight);
            this.scene.add(spotlight.target);
            this.overheadSpotlights.push(spotlight);
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
     * Creates realistic bubble system
     */
    createEnhancedParticles() {
        const bubbleCount = 150; // Reduced for performance with real geometry
        this.bubbles = [];

        // Create bubble texture (circular sprite)
        const bubbleTexture = this.createBubbleTexture();

        // Color palette for bubbles (more subtle, underwater-appropriate)
        const colorPalette = [
            new THREE.Color(0xaaddff), // Light cyan
            new THREE.Color(0xcceeFF), // Very light blue
            new THREE.Color(0xbbddff), // Soft blue
            new THREE.Color(0xddeeff)  // Almost white
        ];

        for (let i = 0; i < bubbleCount; i++) {
            // Create sphere geometry for each bubble
            const size = Math.random() * 0.3 + 0.1;
            const geometry = new THREE.SphereGeometry(size, 8, 8);

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                shininess: 100,
                specular: 0xffffff,
                envMap: null,
                refractionRatio: 0.98
            });

            const bubble = new THREE.Mesh(geometry, material);

            // Random position
            bubble.position.set(
                (Math.random() - 0.5) * this.roomSize * 0.8,
                Math.random() * 18,
                (Math.random() - 0.5) * this.roomSize * 0.8
            );

            // Store velocity in userData
            bubble.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    Math.random() * 0.04 + 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.05 + 0.02
            };

            this.scene.add(bubble);
            this.bubbles.push(bubble);
        }
    }

    /**
     * Create bubble texture for circular appearance
     */
    createBubbleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Create radial gradient for bubble effect
        const gradient = ctx.createRadialGradient(24, 24, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(0.4, 'rgba(200, 230, 255, 0.8)');
        gradient.addColorStop(0.8, 'rgba(150, 200, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        // Add highlight
        const highlight = ctx.createRadialGradient(20, 20, 0, 20, 20, 10);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlight;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
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
     * Creates furniture to make it look like a submerged room
     */
    createFurniture() {
        this.furniture = [];

        // Shared material for wooden furniture
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a3a1a,
            roughness: 0.8,
            metalness: 0.1
        });

        const fabricMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a5f7a,
            roughness: 0.9,
            metalness: 0.0
        });

        // Create Couch
        const couch = this.createCouch(woodMaterial, fabricMaterial);
        couch.position.set(-15, 0, -15);
        couch.rotation.y = Math.PI / 4;
        this.scene.add(couch);
        this.furniture.push(couch);

        // Create Desk
        const desk = this.createDesk(woodMaterial);
        desk.position.set(15, 0, -10);
        desk.rotation.y = -Math.PI / 6;
        this.scene.add(desk);
        this.furniture.push(desk);

        // Create Drawer/Dresser
        const drawer = this.createDrawer(woodMaterial);
        drawer.position.set(-12, 0, 15);
        drawer.rotation.y = Math.PI / 3;
        this.scene.add(drawer);
        this.furniture.push(drawer);
    }

    /**
     * Create a couch mesh
     */
    createCouch(woodMaterial, fabricMaterial) {
        const couchGroup = new THREE.Group();

        // Couch base/seat
        const seatGeometry = new THREE.BoxGeometry(4, 0.8, 2);
        const seat = new THREE.Mesh(seatGeometry, fabricMaterial);
        seat.position.y = 1;
        seat.castShadow = true;
        seat.receiveShadow = true;
        couchGroup.add(seat);

        // Couch back
        const backGeometry = new THREE.BoxGeometry(4, 1.5, 0.3);
        const back = new THREE.Mesh(backGeometry, fabricMaterial);
        back.position.set(0, 1.75, -0.85);
        back.castShadow = true;
        couchGroup.add(back);

        // Armrests
        const armGeometry = new THREE.BoxGeometry(0.4, 1, 2);
        const leftArm = new THREE.Mesh(armGeometry, fabricMaterial);
        leftArm.position.set(-1.8, 1.25, 0);
        leftArm.castShadow = true;
        couchGroup.add(leftArm);

        const rightArm = leftArm.clone();
        rightArm.position.set(1.8, 1.25, 0);
        couchGroup.add(rightArm);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
        const legPositions = [
            [-1.5, 0.4, 0.8],
            [1.5, 0.4, 0.8],
            [-1.5, 0.4, -0.8],
            [1.5, 0.4, -0.8]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            couchGroup.add(leg);
        });

        return couchGroup;
    }

    /**
     * Create a desk mesh
     */
    createDesk(woodMaterial) {
        const deskGroup = new THREE.Group();

        // Desktop
        const topGeometry = new THREE.BoxGeometry(3, 0.15, 1.5);
        const top = new THREE.Mesh(topGeometry, woodMaterial);
        top.position.y = 1.8;
        top.castShadow = true;
        top.receiveShadow = true;
        deskGroup.add(top);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 1.8, 0.15);
        const legPositions = [
            [-1.3, 0.9, 0.65],
            [1.3, 0.9, 0.65],
            [-1.3, 0.9, -0.65],
            [1.3, 0.9, -0.65]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            deskGroup.add(leg);
        });

        // Drawer
        const drawerGeometry = new THREE.BoxGeometry(2.5, 0.4, 1.2);
        const drawerMesh = new THREE.Mesh(drawerGeometry, woodMaterial);
        drawerMesh.position.set(0, 1.3, 0);
        drawerMesh.castShadow = true;
        deskGroup.add(drawerMesh);

        // Drawer handle
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.2
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, 1.3, 0.65);
        deskGroup.add(handle);

        return deskGroup;
    }

    /**
     * Create a drawer/dresser mesh
     */
    createDrawer(woodMaterial) {
        const drawerGroup = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(2, 2.5, 1.2);
        const body = new THREE.Mesh(bodyGeometry, woodMaterial);
        body.position.y = 1.25;
        body.castShadow = true;
        body.receiveShadow = true;
        drawerGroup.add(body);

        // Individual drawers (visual detail)
        const drawerFrontGeometry = new THREE.BoxGeometry(1.8, 0.5, 0.05);
        const drawerPositions = [0.6, 1.25, 1.9];

        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.2
        });

        drawerPositions.forEach(y => {
            const drawerFront = new THREE.Mesh(drawerFrontGeometry, woodMaterial);
            drawerFront.position.set(0, y, 0.625);
            drawerGroup.add(drawerFront);

            // Drawer handles
            const handleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.25);
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.rotation.z = Math.PI / 2;
            handle.position.set(0, y, 0.68);
            drawerGroup.add(handle);
        });

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3);
        const legPositions = [
            [-0.8, 0.15, 0.5],
            [0.8, 0.15, 0.5],
            [-0.8, 0.15, -0.5],
            [0.8, 0.15, -0.5]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            drawerGroup.add(leg);
        });

        return drawerGroup;
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

        // Animate bubble meshes
        if (this.bubbles) {
            this.bubbles.forEach((bubble, i) => {
                const userData = bubble.userData;

                // Update wobble animation
                userData.wobble += userData.wobbleSpeed;

                // Apply velocity with wobble motion
                bubble.position.x += userData.velocity.x + Math.cos(userData.wobble) * 0.02;
                bubble.position.y += userData.velocity.y;
                bubble.position.z += userData.velocity.z + Math.sin(userData.wobble) * 0.02;

                // Add slight rotation for realism
                bubble.rotation.y += 0.01;
                bubble.rotation.x += 0.005;

                // Reset bubbles that reach the top
                if (bubble.position.y > 19) {
                    bubble.position.y = 0.5;
                    bubble.position.x = (Math.random() - 0.5) * this.roomSize * 0.8;
                    bubble.position.z = (Math.random() - 0.5) * this.roomSize * 0.8;

                    // Reset wobble
                    userData.wobble = Math.random() * Math.PI * 2;
                }

                // Pulse opacity slightly for shimmer effect
                const opacityPulse = 0.35 + Math.sin(this.causticTime * 3 + i * 0.5) * 0.1;
                bubble.material.opacity = opacityPulse;
            });
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

        // Animate overhead spotlights for dynamic light streaming effect
        if (this.overheadSpotlights) {
            this.overheadSpotlights.forEach((spotlight, index) => {
                const baseIntensities = [2.0, 1.8, 1.5, 1.6];
                const baseIntensity = baseIntensities[index];

                // Pulse intensity to simulate water surface movement
                spotlight.intensity = baseIntensity + Math.sin(this.causticTime * 1.5 + index * 1.2) * 0.4;

                // Slight position wobble to simulate light refraction through water
                const wobbleAmount = 0.8;
                spotlight.position.x += Math.sin(this.causticTime * 0.8 + index) * wobbleAmount * 0.01;
                spotlight.position.z += Math.cos(this.causticTime * 0.8 + index) * wobbleAmount * 0.01;
            });
        }
    }
}
