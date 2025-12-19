/**
 * FISH MODULE
 *
 * Individual fish and school management with flocking AI.
 * Features:
 * - Boids-based flocking (cohesion, separation, alignment)
 * - Player avoidance/approach behavior
 * - Smooth, graceful swimming animation
 * - Simple geometry-based fish models
 */

/**
 * Single Fish Entity
 */
class Fish {
    constructor(scene, startPosition, fishType = null) {
        this.scene = scene;
        this.position = startPosition.clone();
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 2
        );
        this.acceleration = new THREE.Vector3();

        // Fish type (1, 2, or 3 for different shapes)
        this.fishType = fishType || (Math.floor(Math.random() * 3) + 1);

        // Fish properties
        this.maxSpeed = 2 + Math.random() * 2;
        this.maxForce = 0.05;
        this.size = 0.3 + Math.random() * 0.4;
        this.color = this.randomFishColor();

        // Behavior parameters
        this.personalSpace = 1.5; // Separation distance
        this.visionRange = 8; // How far fish can see neighbors
        this.avoidanceRange = 5; // How far to detect player

        // Animation
        this.tailWiggle = 0;
        this.tailSpeed = 2 + Math.random() * 2;

        this.createMesh();
    }

    /**
     * Create fish mesh based on type
     */
    createMesh() {
        switch (this.fishType) {
            case 1:
                this.createType1Mesh(); // Elongated fish
                break;
            case 2:
                this.createType2Mesh(); // Round/pufferfish
                break;
            case 3:
                this.createType3Mesh(); // Flat/wide fish
                break;
            default:
                this.createType1Mesh();
        }
    }

    /**
     * Type 1: Elongated tropical fish (current design)
     */
    createType1Mesh() {
        const group = new THREE.Group();

        // Create scale pattern texture
        const scaleTexture = this.createScaleTexture();

        // Body - more elongated and fish-shaped
        const bodyGeometry = new THREE.SphereGeometry(this.size, 16, 12);
        bodyGeometry.scale(2.2, 0.7, 0.6); // Much more elongated

        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 90,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.3,
            specular: 0xffffff,
            map: scaleTexture,
            bumpMap: scaleTexture,
            bumpScale: 0.02
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        this.body = body;

        // Fan-shaped tail fin
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.quadraticCurveTo(-this.size * 0.8, -this.size * 0.6, -this.size * 1.0, -this.size * 0.4);
        tailShape.lineTo(-this.size * 0.9, 0);
        tailShape.lineTo(-this.size * 1.0, this.size * 0.4);
        tailShape.quadraticCurveTo(-this.size * 0.8, this.size * 0.6, 0, 0);

        const tailGeometry = new THREE.ShapeGeometry(tailShape);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.25,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -this.size * 1.3;
        group.add(tail);
        this.tail = tail;

        // Dorsal fin (top)
        const dorsalShape = new THREE.Shape();
        dorsalShape.moveTo(0, 0);
        dorsalShape.quadraticCurveTo(-this.size * 0.3, this.size * 0.5, -this.size * 0.5, this.size * 0.4);
        dorsalShape.lineTo(-this.size * 0.4, 0);
        dorsalShape.lineTo(0, 0);

        const dorsalGeometry = new THREE.ShapeGeometry(dorsalShape);
        const dorsalMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });

        const dorsalFin = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
        dorsalFin.position.set(-this.size * 0.2, this.size * 0.5, 0);
        dorsalFin.rotation.x = Math.PI / 2;
        group.add(dorsalFin);

        // Pectoral fins (sides)
        const pectoralShape = new THREE.Shape();
        pectoralShape.moveTo(0, 0);
        pectoralShape.quadraticCurveTo(this.size * 0.3, this.size * 0.3, this.size * 0.5, this.size * 0.2);
        pectoralShape.lineTo(this.size * 0.3, 0);
        pectoralShape.lineTo(0, 0);

        const pectoralGeometry = new THREE.ShapeGeometry(pectoralShape);
        const pectoralMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const pectoralLeft = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectoralLeft.position.set(this.size * 0.3, 0, this.size * 0.4);
        pectoralLeft.rotation.y = -Math.PI / 4;
        group.add(pectoralLeft);

        const pectoralRight = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectoralRight.position.set(this.size * 0.3, 0, -this.size * 0.4);
        pectoralRight.rotation.y = Math.PI / 4;
        group.add(pectoralRight);

        // Eyes with realistic look
        const eyeGeometry = new THREE.SphereGeometry(this.size * 0.15, 12, 12);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 150,
            emissive: 0x222222,
            emissiveIntensity: 0.3
        });

        const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeLeft.position.set(this.size * 1.0, this.size * 0.25, this.size * 0.35);
        group.add(eyeLeft);

        const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeRight.position.set(this.size * 1.0, this.size * 0.25, -this.size * 0.35);
        group.add(eyeRight);

        // Eye highlights
        const highlightGeometry = new THREE.SphereGeometry(this.size * 0.06, 8, 8);
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightLeft.position.set(this.size * 1.05, this.size * 0.3, this.size * 0.38);
        group.add(highlightLeft);

        const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightRight.position.set(this.size * 1.05, this.size * 0.3, -this.size * 0.38);
        group.add(highlightRight);

        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    /**
     * Type 2: Round pufferfish-style
     */
    createType2Mesh() {
        const group = new THREE.Group();

        // Create scale pattern texture
        const scaleTexture = this.createScaleTexture();

        // Body - more spherical/round
        const bodyGeometry = new THREE.SphereGeometry(this.size, 16, 16);
        bodyGeometry.scale(1.3, 1.1, 1.0); // More rounded, slightly wider

        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 100,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.35,
            specular: 0xffffff,
            map: scaleTexture,
            bumpMap: scaleTexture,
            bumpScale: 0.03
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        this.body = body;

        // Smaller, rounded tail fin
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.quadraticCurveTo(-this.size * 0.5, -this.size * 0.4, -this.size * 0.7, -this.size * 0.3);
        tailShape.lineTo(-this.size * 0.6, 0);
        tailShape.lineTo(-this.size * 0.7, this.size * 0.3);
        tailShape.quadraticCurveTo(-this.size * 0.5, this.size * 0.4, 0, 0);

        const tailGeometry = new THREE.ShapeGeometry(tailShape);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -this.size * 0.9;
        group.add(tail);
        this.tail = tail;

        // Small dorsal fin (top)
        const dorsalShape = new THREE.Shape();
        dorsalShape.moveTo(0, 0);
        dorsalShape.quadraticCurveTo(-this.size * 0.2, this.size * 0.35, -this.size * 0.3, this.size * 0.3);
        dorsalShape.lineTo(-this.size * 0.25, 0);
        dorsalShape.lineTo(0, 0);

        const dorsalGeometry = new THREE.ShapeGeometry(dorsalShape);
        const dorsalMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.25,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });

        const dorsalFin = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
        dorsalFin.position.set(-this.size * 0.1, this.size * 0.6, 0);
        dorsalFin.rotation.x = Math.PI / 2;
        group.add(dorsalFin);

        // Small side fins
        const pectoralShape = new THREE.Shape();
        pectoralShape.moveTo(0, 0);
        pectoralShape.quadraticCurveTo(this.size * 0.25, this.size * 0.25, this.size * 0.4, this.size * 0.15);
        pectoralShape.lineTo(this.size * 0.25, 0);
        pectoralShape.lineTo(0, 0);

        const pectoralGeometry = new THREE.ShapeGeometry(pectoralShape);
        const pectoralMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.25,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const pectoralLeft = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectoralLeft.position.set(this.size * 0.3, 0, this.size * 0.5);
        pectoralLeft.rotation.y = -Math.PI / 6;
        group.add(pectoralLeft);

        const pectoralRight = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectoralRight.position.set(this.size * 0.3, 0, -this.size * 0.5);
        pectoralRight.rotation.y = Math.PI / 6;
        group.add(pectoralRight);

        // Large eyes (characteristic of round fish)
        const eyeGeometry = new THREE.SphereGeometry(this.size * 0.2, 12, 12);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 150,
            emissive: 0x333333,
            emissiveIntensity: 0.4
        });

        const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeLeft.position.set(this.size * 0.8, this.size * 0.3, this.size * 0.4);
        group.add(eyeLeft);

        const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeRight.position.set(this.size * 0.8, this.size * 0.3, -this.size * 0.4);
        group.add(eyeRight);

        // Eye highlights
        const highlightGeometry = new THREE.SphereGeometry(this.size * 0.08, 8, 8);
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95
        });

        const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightLeft.position.set(this.size * 0.88, this.size * 0.36, this.size * 0.44);
        group.add(highlightLeft);

        const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightRight.position.set(this.size * 0.88, this.size * 0.36, -this.size * 0.44);
        group.add(highlightRight);

        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    /**
     * Type 3: Flat/wide fish (like a butterflyfish)
     */
    createType3Mesh() {
        const group = new THREE.Group();

        // Create scale pattern texture
        const scaleTexture = this.createScaleTexture();

        // Body - flat and wide
        const bodyGeometry = new THREE.SphereGeometry(this.size, 16, 12);
        bodyGeometry.scale(1.5, 1.2, 0.4); // Wide and flat

        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 85,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.3,
            specular: 0xffffff,
            map: scaleTexture,
            bumpMap: scaleTexture,
            bumpScale: 0.02
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        this.body = body;

        // Wide, triangular tail
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.lineTo(-this.size * 0.8, -this.size * 0.7);
        tailShape.lineTo(-this.size * 0.7, 0);
        tailShape.lineTo(-this.size * 0.8, this.size * 0.7);
        tailShape.lineTo(0, 0);

        const tailGeometry = new THREE.ShapeGeometry(tailShape);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 75,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.25,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -this.size * 1.1;
        group.add(tail);
        this.tail = tail;

        // Large dorsal fin (top) - characteristic of flat fish
        const dorsalShape = new THREE.Shape();
        dorsalShape.moveTo(0, 0);
        dorsalShape.quadraticCurveTo(-this.size * 0.4, this.size * 0.7, -this.size * 0.7, this.size * 0.6);
        dorsalShape.lineTo(-this.size * 0.6, 0);
        dorsalShape.lineTo(0, 0);

        const dorsalGeometry = new THREE.ShapeGeometry(dorsalShape);
        const dorsalMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 75,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });

        const dorsalFin = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
        dorsalFin.position.set(-this.size * 0.3, this.size * 0.7, 0);
        dorsalFin.rotation.x = Math.PI / 2;
        group.add(dorsalFin);

        // Ventral fin (bottom) for flat fish
        const ventralFin = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
        ventralFin.position.set(-this.size * 0.3, -this.size * 0.7, 0);
        ventralFin.rotation.x = -Math.PI / 2;
        group.add(ventralFin);

        // Small pectoral fins
        const pectoralShape = new THREE.Shape();
        pectoralShape.moveTo(0, 0);
        pectoralShape.quadraticCurveTo(this.size * 0.2, this.size * 0.2, this.size * 0.35, this.size * 0.15);
        pectoralShape.lineTo(this.size * 0.2, 0);
        pectoralShape.lineTo(0, 0);

        const pectoralGeometry = new THREE.ShapeGeometry(pectoralShape);
        const pectoralMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 75,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const pectoralLeft = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectoralLeft.position.set(this.size * 0.4, 0, this.size * 0.25);
        pectoralLeft.rotation.y = -Math.PI / 3;
        group.add(pectoralLeft);

        const pectoralRight = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectoralRight.position.set(this.size * 0.4, 0, -this.size * 0.25);
        pectoralRight.rotation.y = Math.PI / 3;
        group.add(pectoralRight);

        // Medium-sized eyes
        const eyeGeometry = new THREE.SphereGeometry(this.size * 0.18, 12, 12);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 150,
            emissive: 0x222222,
            emissiveIntensity: 0.3
        });

        const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeLeft.position.set(this.size * 0.9, this.size * 0.4, this.size * 0.25);
        group.add(eyeLeft);

        const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeRight.position.set(this.size * 0.9, this.size * 0.4, -this.size * 0.25);
        group.add(eyeRight);

        // Eye highlights
        const highlightGeometry = new THREE.SphereGeometry(this.size * 0.07, 8, 8);
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightLeft.position.set(this.size * 0.98, this.size * 0.45, this.size * 0.28);
        group.add(highlightLeft);

        const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightRight.position.set(this.size * 0.98, this.size * 0.45, -this.size * 0.28);
        group.add(highlightRight);

        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    /**
     * Create procedural scale pattern texture
     */
    createScaleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Base color with slight variation
        const baseColor = new THREE.Color(this.color);
        ctx.fillStyle = `rgb(${baseColor.r * 255}, ${baseColor.g * 255}, ${baseColor.b * 255})`;
        ctx.fillRect(0, 0, 128, 128);

        // Draw scale pattern
        ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`;
        ctx.lineWidth = 1;

        const scaleSize = 8;
        for (let y = 0; y < 128; y += scaleSize) {
            for (let x = 0; x < 128; x += scaleSize) {
                const offsetX = (y / scaleSize) % 2 === 0 ? 0 : scaleSize / 2;
                ctx.beginPath();
                ctx.arc(x + offsetX, y, scaleSize / 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 2);

        return texture;
    }

    /**
     * Generate vibrant, whimsical fish colors
     */
    randomFishColor() {
        const colors = [
            0xff7733, // Vibrant Orange
            0xffbb33, // Golden Yellow
            0x33ddff, // Bright Cyan
            0x44ffaa, // Neon Green
            0x5588ff, // Bright Blue
            0xdd77ff, // Vibrant Purple
            0xff5577, // Hot Pink
            0x77ffff, // Aqua
            0xffaa77, // Peach
            0xaaff77  // Lime
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Apply flocking behaviors (Boids algorithm)
     */
    flock(fishArray) {
        const separation = this.separate(fishArray);
        const alignment = this.align(fishArray);
        const cohesion = this.cohesion(fishArray);

        // Weight the behaviors
        separation.multiplyScalar(1.5);
        alignment.multiplyScalar(1.0);
        cohesion.multiplyScalar(1.0);

        this.applyForce(separation);
        this.applyForce(alignment);
        this.applyForce(cohesion);
    }

    /**
     * Separation: steer to avoid crowding local flockmates
     */
    separate(fishArray) {
        const steer = new THREE.Vector3();
        let count = 0;

        fishArray.forEach(other => {
            const distance = this.position.distanceTo(other.position);
            if (other !== this && distance < this.personalSpace && distance > 0) {
                const diff = new THREE.Vector3().subVectors(this.position, other.position);
                diff.normalize();
                diff.divideScalar(distance); // Weight by distance
                steer.add(diff);
                count++;
            }
        });

        if (count > 0) {
            steer.divideScalar(count);
        }

        if (steer.length() > 0) {
            steer.normalize();
            steer.multiplyScalar(this.maxSpeed);
            steer.sub(this.velocity);
            steer.clampLength(0, this.maxForce);
        }

        return steer;
    }

    /**
     * Alignment: steer towards the average heading of local flockmates
     */
    align(fishArray) {
        const sum = new THREE.Vector3();
        let count = 0;

        fishArray.forEach(other => {
            const distance = this.position.distanceTo(other.position);
            if (other !== this && distance < this.visionRange) {
                sum.add(other.velocity);
                count++;
            }
        });

        if (count > 0) {
            sum.divideScalar(count);
            sum.normalize();
            sum.multiplyScalar(this.maxSpeed);

            const steer = new THREE.Vector3().subVectors(sum, this.velocity);
            steer.clampLength(0, this.maxForce);
            return steer;
        }

        return new THREE.Vector3();
    }

    /**
     * Cohesion: steer to move toward the average position of local flockmates
     */
    cohesion(fishArray) {
        const sum = new THREE.Vector3();
        let count = 0;

        fishArray.forEach(other => {
            const distance = this.position.distanceTo(other.position);
            if (other !== this && distance < this.visionRange) {
                sum.add(other.position);
                count++;
            }
        });

        if (count > 0) {
            sum.divideScalar(count);
            return this.seek(sum);
        }

        return new THREE.Vector3();
    }

    /**
     * Seek a target position
     */
    seek(target) {
        const desired = new THREE.Vector3().subVectors(target, this.position);
        desired.normalize();
        desired.multiplyScalar(this.maxSpeed);

        const steer = new THREE.Vector3().subVectors(desired, this.velocity);
        steer.clampLength(0, this.maxForce);
        return steer;
    }

    /**
     * Avoid player with enhanced glow effects
     */
    reactToPlayer(playerPosition) {
        const distance = this.position.distanceTo(playerPosition);

        if (distance < this.avoidanceRange) {
            // Most fish flee
            const flee = new THREE.Vector3().subVectors(this.position, playerPosition);
            flee.normalize();
            flee.multiplyScalar(this.maxSpeed * 1.5);

            const steer = new THREE.Vector3().subVectors(flee, this.velocity);
            steer.clampLength(0, this.maxForce * 2);

            this.applyForce(steer);

            // Enhanced glow when startled - pulse brighter
            if (this.body) {
                this.body.material.emissive.setHex(this.color);
                this.body.material.emissiveIntensity = 0.6; // Brighter glow
            }
        } else {
            // Return to normal glow
            if (this.body) {
                this.body.material.emissive.setHex(this.color);
                this.body.material.emissiveIntensity = 0.3;
            }
        }
    }

    /**
     * Keep fish within bounds
     */
    boundaries(bounds = 23) {
        const force = new THREE.Vector3();

        if (this.position.x < -bounds) force.x = this.maxForce * 2;
        if (this.position.x > bounds) force.x = -this.maxForce * 2;
        if (this.position.y < 1) force.y = this.maxForce * 2;
        if (this.position.y > 17) force.y = -this.maxForce * 2;
        if (this.position.z < -bounds) force.z = this.maxForce * 2;
        if (this.position.z > bounds) force.z = -this.maxForce * 2;

        this.applyForce(force);
    }

    /**
     * Apply a force to acceleration
     */
    applyForce(force) {
        this.acceleration.add(force);
    }

    /**
     * Update fish position and animation
     */
    update(deltaTime) {
        // Update velocity
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxSpeed);

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Reset acceleration
        this.acceleration.set(0, 0, 0);

        // Update mesh
        this.mesh.position.copy(this.position);

        // Orient fish in direction of movement
        if (this.velocity.length() > 0.1) {
            const direction = this.velocity.clone().normalize();
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = targetRotation;

            // Pitch based on y velocity
            this.mesh.rotation.x = -direction.y * 0.5;
        }

        // Animate tail
        this.tailWiggle += this.tailSpeed * deltaTime;
        if (this.tail) {
            this.tail.rotation.y = Math.sin(this.tailWiggle) * 0.3;
        }
    }

    /**
     * Remove from scene
     */
    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

/**
 * Fish School Manager
 */
export class FishSchool {
    constructor(scene, count = 15) {
        this.scene = scene;
        this.fish = [];

        // Spawn fish
        for (let i = 0; i < count; i++) {
            const startPos = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                Math.random() * 15 + 2,
                (Math.random() - 0.5) * 40
            );
            this.fish.push(new Fish(scene, startPos));
        }
    }

    /**
     * Update all fish
     */
    update(deltaTime, playerPosition) {
        this.fish.forEach(fish => {
            fish.flock(this.fish);
            fish.reactToPlayer(playerPosition);
            fish.boundaries();
            fish.update(deltaTime);
        });
    }

    /**
     * Get all fish positions for mini-map
     */
    getPositions() {
        return this.fish.map(fish => fish.position);
    }

    /**
     * Add new fish to the school
     */
    addFish(count = 1) {
        for (let i = 0; i < count; i++) {
            const startPos = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                Math.random() * 15 + 2,
                (Math.random() - 0.5) * 40
            );
            this.fish.push(new Fish(this.scene, startPos));
        }
    }

    /**
     * Clean up
     */
    dispose() {
        this.fish.forEach(fish => fish.dispose());
        this.fish = [];
    }
}
