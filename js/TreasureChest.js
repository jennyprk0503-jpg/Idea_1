/**
 * TREASURE CHEST MODULE
 *
 * Creates a treasure chest with a teddy bear inside.
 * When opened, the teddy bear floats upward gracefully.
 */

export class TreasureChest {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.isOpen = false;

        // Animation state
        this.lidAngle = 0;
        this.lidTargetAngle = 0;
        this.bearFloatHeight = 0;
        this.bearRotation = 0;

        // References
        this.chest = null;
        this.lid = null;
        this.bear = null;

        this.createChest();
        this.createTeddyBear();
    }

    /**
     * Create the treasure chest mesh
     */
    createChest() {
        const group = new THREE.Group();

        // Chest base
        const baseGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x6b4423,
            shininess: 30,
            flatShading: true
        });

        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.75;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Chest lid (separate for opening animation)
        const lidGeometry = new THREE.BoxGeometry(2.1, 0.6, 1.6);
        const lidMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b5a2b,
            shininess: 30,
            flatShading: true
        });

        const lid = new THREE.Mesh(lidGeometry, lidMaterial);
        lid.position.y = 1.5;
        lid.position.z = -0.4; // Pivot point at back
        lid.castShadow = true;
        group.add(lid);
        this.lid = lid;

        // Gold trim/decorations
        const trimMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 100,
            metalness: 0.8
        });

        // Front trim
        const trimGeometry = new THREE.BoxGeometry(2.2, 0.1, 0.1);
        const frontTrim = new THREE.Mesh(trimGeometry, trimMaterial);
        frontTrim.position.set(0, 0.75, 0.8);
        group.add(frontTrim);

        // Lock decoration
        const lockGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const lock = new THREE.Mesh(lockGeometry, trimMaterial);
        lock.position.set(0, 1.2, 0.8);
        group.add(lock);

        // Keyhole
        const keyholeGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.05);
        const keyholeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const keyhole = new THREE.Mesh(keyholeGeometry, keyholeMaterial);
        keyhole.position.set(0, 1.1, 0.82);
        group.add(keyhole);

        // Position chest
        group.position.copy(this.position);
        group.position.y += 0.01; // Slightly above floor

        // Add glow effect when closed
        const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 1;
        group.add(glow);
        this.glow = glow;

        // Add proximity ring indicator (dynamic)
        const ringGeometry = new THREE.TorusGeometry(2.5, 0.15, 8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 0.1;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        this.proximityRing = ring;

        // Add permanent interaction range indicator ring
        const rangeRingGeometry = new THREE.TorusGeometry(8, 0.1, 8, 32);
        const rangeRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x66ddff,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        const rangeRing = new THREE.Mesh(rangeRingGeometry, rangeRingMaterial);
        rangeRing.position.y = 0.05;
        rangeRing.rotation.x = Math.PI / 2;
        group.add(rangeRing);
        this.interactionRangeRing = rangeRing;

        this.scene.add(group);
        this.chest = group;
    }

    /**
     * Create teddy bear mesh
     */
    createTeddyBear() {
        const group = new THREE.Group();

        const bearColor = 0xcd853f; // Tan/brown color

        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        bodyGeometry.scale(1, 1.2, 0.9);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: bearColor,
            shininess: 20,
            flatShading: false
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 0.9;
        group.add(head);

        // Ears
        const earGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const earLeft = new THREE.Mesh(earGeometry, bodyMaterial);
        earLeft.position.set(-0.18, 1.05, 0);
        group.add(earLeft);

        const earRight = new THREE.Mesh(earGeometry, bodyMaterial);
        earRight.position.set(0.18, 1.05, 0);
        group.add(earRight);

        // Snout
        const snoutGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const snoutMaterial = new THREE.MeshPhongMaterial({
            color: 0xdeb887,
            shininess: 20
        });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.scale.set(0.8, 0.6, 1);
        snout.position.set(0, 0.85, 0.2);
        group.add(snout);

        // Nose
        const noseGeometry = new THREE.SphereGeometry(0.04, 6, 6);
        const noseMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.88, 0.3);
        group.add(nose);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeLeft.position.set(-0.1, 0.95, 0.18);
        group.add(eyeLeft);

        const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeRight.position.set(0.1, 0.95, 0.18);
        group.add(eyeRight);

        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.08, 0.3, 4, 8);
        const armLeft = new THREE.Mesh(armGeometry, bodyMaterial);
        armLeft.rotation.z = Math.PI / 4;
        armLeft.position.set(-0.35, 0.5, 0);
        group.add(armLeft);

        const armRight = new THREE.Mesh(armGeometry, bodyMaterial);
        armRight.rotation.z = -Math.PI / 4;
        armRight.position.set(0.35, 0.5, 0);
        group.add(armRight);

        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.1, 0.25, 4, 8);
        const legLeft = new THREE.Mesh(legGeometry, bodyMaterial);
        legLeft.position.set(-0.15, 0.15, 0);
        group.add(legLeft);

        const legRight = new THREE.Mesh(legGeometry, bodyMaterial);
        legRight.position.set(0.15, 0.15, 0);
        group.add(legRight);

        // Position bear inside chest (hidden initially)
        group.position.copy(this.position);
        group.position.y = 0.5;
        group.visible = false; // Hidden until chest opens

        this.scene.add(group);
        this.bear = group;
    }

    /**
     * Open the chest and reveal the teddy bear
     */
    open() {
        if (this.isOpen) return;

        console.log('Opening treasure chest...');
        this.isOpen = true;
        this.lidTargetAngle = -Math.PI / 2; // 90 degrees open

        // Make bear visible
        this.bear.visible = true;

        // Hide glow effect and interaction ring
        if (this.glow) {
            this.glow.visible = false;
        }
        if (this.interactionRangeRing) {
            this.interactionRangeRing.visible = false;
        }
    }

    /**
     * Update proximity feedback based on player distance
     * @param {number} distance - Distance from player to chest
     */
    updateProximity(distance) {
        if (this.isOpen) return;

        const interactionRange = 8;

        if (distance < interactionRange) {
            // Player is within interaction range
            const proximityFactor = 1 - (distance / interactionRange);

            // Intensify glow based on proximity
            if (this.glow) {
                this.glow.material.opacity = 0.15 + proximityFactor * 0.25;
            }

            // Show and pulse proximity ring
            if (this.proximityRing) {
                this.proximityRing.material.opacity = 0.3 + proximityFactor * 0.4;
                this.proximityRing.visible = true;
            }
        } else {
            // Player is out of range - use default glow
            if (this.proximityRing) {
                this.proximityRing.visible = false;
            }
        }
    }

    /**
     * Update animation
     */
    update(deltaTime) {
        // Animate lid opening
        if (this.lidAngle < this.lidTargetAngle) {
            this.lidAngle += deltaTime * 2; // Open speed
            if (this.lidAngle > this.lidTargetAngle) {
                this.lidAngle = this.lidTargetAngle;
            }

            if (this.lid) {
                this.lid.rotation.x = this.lidAngle;
            }
        }

        // Animate bear floating up after chest is open
        if (this.isOpen && this.bear.visible) {
            // Float upward
            this.bearFloatHeight += deltaTime * 1.5;

            // Gentle rotation while floating
            this.bearRotation += deltaTime * 0.5;

            this.bear.position.y = this.position.y + 0.5 + this.bearFloatHeight;
            this.bear.rotation.y = this.bearRotation;

            // Gentle sway
            this.bear.position.x = this.position.x + Math.sin(this.bearRotation * 2) * 0.3;
            this.bear.position.z = this.position.z + Math.cos(this.bearRotation * 2) * 0.3;

            // Stop floating when it reaches a certain height
            if (this.bearFloatHeight > 15) {
                this.bearFloatHeight = 15;
            }
        }

        // Idle animation for glow when chest is closed
        if (!this.isOpen && this.glow) {
            const pulse = Math.sin(Date.now() * 0.002) * 0.05 + 0.1;
            this.glow.material.opacity = pulse;
            this.glow.rotation.y += deltaTime * 0.5;
        }

        // Animate proximity ring rotation
        if (!this.isOpen && this.proximityRing && this.proximityRing.visible) {
            this.proximityRing.rotation.z += deltaTime * 2; // Rotate ring
        }

        // Animate interaction range ring (always visible when chest is closed)
        if (!this.isOpen && this.interactionRangeRing) {
            this.interactionRangeRing.rotation.z += deltaTime * 0.5; // Slow rotation
            // Subtle pulsing opacity
            const pulse = Math.sin(Date.now() * 0.001) * 0.1 + 0.25;
            this.interactionRangeRing.material.opacity = pulse;
        }
    }

    /**
     * Get chest position for mini-map
     */
    getPosition() {
        return this.position;
    }

    /**
     * Clean up
     */
    dispose() {
        if (this.chest) {
            this.scene.remove(this.chest);
            this.chest.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }

        if (this.bear) {
            this.scene.remove(this.bear);
            this.bear.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}
