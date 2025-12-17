/**
 * CAMERA CONTROLLER MODULE
 *
 * Handles smooth, fluid camera movement with underwater swimming feel.
 * Provides both keyboard and gesture-based navigation.
 * Movement is intentionally slow and graceful to match the installation aesthetic.
 */

export class CameraController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;

        // Movement parameters - tuned for slow, fluid underwater feel
        this.moveSpeed = 3.0; // Units per second
        this.rotateSpeed = 1.2; // Radians per second
        this.dampingFactor = 0.85; // Smooth deceleration

        // Current state
        this.velocity = new THREE.Vector3();
        this.rotationVelocity = 0;
        this.targetRotation = 0;

        // Boundaries (room size)
        this.bounds = {
            minX: -23,
            maxX: 23,
            minY: 1.5,
            maxY: 17,
            minZ: -23,
            maxZ: 23
        };

        // Initial camera orientation
        this.camera.rotation.order = 'YXZ';
        this.yaw = 0;
        this.pitch = 0;
    }

    /**
     * Initiate forward movement
     */
    moveForward() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.y = 0; // Keep movement horizontal
        direction.normalize();
        direction.multiplyScalar(this.moveSpeed);

        this.velocity.add(direction);
    }

    /**
     * Rotate camera left (smooth interpolation)
     * @param {number} intensity - 0 to 1, for gesture-based variable speed
     */
    rotateLeft(intensity = 1.0) {
        this.targetRotation = this.rotateSpeed * intensity;
        this.rotationVelocity += this.targetRotation * 0.35; // Much faster rotation
    }

    /**
     * Rotate camera right (smooth interpolation)
     * @param {number} intensity - 0 to 1, for gesture-based variable speed
     */
    rotateRight(intensity = 1.0) {
        this.targetRotation = -this.rotateSpeed * intensity;
        this.rotationVelocity += this.targetRotation * 0.35; // Much faster rotation
    }

    /**
     * Look up
     */
    lookUp(amount = 0.02) {
        this.pitch += amount;
        this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
    }

    /**
     * Look down
     */
    lookDown(amount = 0.02) {
        this.pitch -= amount;
        this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
    }

    /**
     * Update camera position and rotation with smooth interpolation
     */
    update(deltaTime) {
        // Apply rotation with smooth damping
        this.yaw += this.rotationVelocity * deltaTime;
        this.rotationVelocity *= this.dampingFactor;

        // Update camera rotation
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        // Apply velocity to position
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.camera.position.add(movement);

        // Apply damping to velocity for smooth deceleration
        this.velocity.multiplyScalar(this.dampingFactor);

        // Stop very small velocities to prevent floating point drift
        if (this.velocity.length() < 0.001) {
            this.velocity.set(0, 0, 0);
        }

        // Enforce boundaries with soft bounce
        this.enforceBounds();

        // Add subtle floating motion for underwater feel
        this.addFloatingMotion();
    }

    /**
     * Keep camera within room bounds with soft bounce
     */
    enforceBounds() {
        const pos = this.camera.position;
        const bounce = 0.3; // Bounce factor

        if (pos.x < this.bounds.minX) {
            pos.x = this.bounds.minX;
            this.velocity.x *= -bounce;
        } else if (pos.x > this.bounds.maxX) {
            pos.x = this.bounds.maxX;
            this.velocity.x *= -bounce;
        }

        if (pos.y < this.bounds.minY) {
            pos.y = this.bounds.minY;
            this.velocity.y *= -bounce;
        } else if (pos.y > this.bounds.maxY) {
            pos.y = this.bounds.maxY;
            this.velocity.y *= -bounce;
        }

        if (pos.z < this.bounds.minZ) {
            pos.z = this.bounds.minZ;
            this.velocity.z *= -bounce;
        } else if (pos.z > this.bounds.maxZ) {
            pos.z = this.bounds.maxZ;
            this.velocity.z *= -bounce;
        }
    }

    /**
     * Add subtle floating/bobbing motion for underwater immersion
     */
    addFloatingMotion() {
        const time = Date.now() * 0.001;
        const bobAmount = 0.05;

        // Gentle sine wave bobbing
        const targetY = this.camera.position.y + Math.sin(time * 0.5) * bobAmount * 0.01;

        // Very subtle horizontal drift
        const driftX = Math.sin(time * 0.3) * 0.001;
        const driftZ = Math.cos(time * 0.4) * 0.001;

        this.camera.position.y += (targetY - this.camera.position.y) * 0.01;
        this.camera.position.x += driftX;
        this.camera.position.z += driftZ;
    }

    /**
     * Get current camera state
     */
    getState() {
        return {
            position: this.camera.position.clone(),
            rotation: {
                yaw: this.yaw,
                pitch: this.pitch
            },
            velocity: this.velocity.clone()
        };
    }

    /**
     * Set camera position (useful for debugging or special events)
     */
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
        this.velocity.set(0, 0, 0);
    }

    /**
     * Look at a specific point
     */
    lookAt(target) {
        const direction = new THREE.Vector3().subVectors(target, this.camera.position);
        direction.normalize();

        // Calculate yaw and pitch from direction vector
        this.yaw = Math.atan2(direction.x, direction.z);
        this.pitch = Math.asin(-direction.y);
    }
}
