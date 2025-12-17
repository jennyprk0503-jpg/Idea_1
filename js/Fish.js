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
    constructor(scene, startPosition) {
        this.scene = scene;
        this.position = startPosition.clone();
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 2
        );
        this.acceleration = new THREE.Vector3();

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
     * Create fish geometry and mesh with enhanced whimsical materials
     */
    createMesh() {
        const group = new THREE.Group();

        // Body (ellipsoid) with emissive glow
        const bodyGeometry = new THREE.SphereGeometry(this.size, 12, 10); // More segments for smoother look
        bodyGeometry.scale(1.5, 0.8, 0.8);

        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 90,
            flatShading: false, // Smooth shading for better look
            emissive: this.color,
            emissiveIntensity: 0.3, // Adds glow
            specular: 0xffffff
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        this.body = body;

        // Tail with vibrant colors
        const tailGeometry = new THREE.ConeGeometry(this.size * 0.5, this.size * 0.8, 6);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.25
        });

        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.rotation.z = Math.PI / 2;
        tail.position.x = -this.size * 1.2;
        group.add(tail);
        this.tail = tail;

        // Fins with transparency and glow
        const finGeometry = new THREE.ConeGeometry(this.size * 0.3, this.size * 0.6, 4);
        const finMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 80,
            transparent: true,
            opacity: 0.85,
            flatShading: false,
            emissive: this.color,
            emissiveIntensity: 0.2
        });

        const finTop = new THREE.Mesh(finGeometry, finMaterial);
        finTop.rotation.z = Math.PI / 2;
        finTop.rotation.y = Math.PI / 2;
        finTop.position.set(0, this.size * 0.5, 0);
        group.add(finTop);

        // Eyes with white glow
        const eyeGeometry = new THREE.SphereGeometry(this.size * 0.15, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 120,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });

        const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeLeft.position.set(this.size * 0.8, this.size * 0.3, this.size * 0.4);
        group.add(eyeLeft);

        const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeRight.position.set(this.size * 0.8, this.size * 0.3, -this.size * 0.4);
        group.add(eyeRight);

        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
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
