// Interactive Underwater Experience
// Main application class

class UnderwaterExperience {
    constructor() {
        this.canvas = document.getElementById('underwaterCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fish = [];
        this.bubbles = [];
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.started = false;
        this.soundEnabled = false;

        this.setupCanvas();
        this.setupEventListeners();
        this.initializeFish(20);
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });

        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Click to create ripples and bubbles
        this.canvas.addEventListener('click', (e) => {
            if (this.started) {
                this.createRipple(e.clientX, e.clientY);
                this.createBubbleBurst(e.clientX, e.clientY);
            }
        });

        // Sound toggle
        document.getElementById('toggleSound').addEventListener('click', () => {
            this.toggleSound();
        });

        // Fullscreen toggle
        document.getElementById('toggleFullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Add fish button
        document.getElementById('addFish').addEventListener('click', () => {
            this.addFish(5);
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (!this.started) return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.addFish(3);
            } else if (e.code === 'KeyF') {
                this.toggleFullscreen();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    start() {
        this.started = true;
        document.getElementById('underwater-container').classList.add('started');
        setTimeout(() => {
            document.getElementById('welcome').style.display = 'none';
        }, 500);
    }

    initializeFish(count) {
        for (let i = 0; i < count; i++) {
            this.fish.push(new Fish(this.canvas.width, this.canvas.height));
        }
        this.updateFishCounter();
    }

    addFish(count) {
        for (let i = 0; i < count; i++) {
            this.fish.push(new Fish(this.canvas.width, this.canvas.height));
        }
        this.updateFishCounter();
    }

    updateFishCounter() {
        document.getElementById('fishCount').textContent = this.fish.length;
    }

    createRipple(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, 'ripple'));
        }
    }

    createBubbleBurst(x, y) {
        for (let i = 0; i < 15; i++) {
            this.bubbles.push(new Bubble(x, y));
        }
    }

    toggleSound() {
        const audio = document.getElementById('ambientSound');
        const btn = document.getElementById('toggleSound');

        if (this.soundEnabled) {
            audio.pause();
            btn.textContent = '🔇 Sound';
            this.soundEnabled = false;
        } else {
            audio.play();
            btn.textContent = '🔊 Sound';
            this.soundEnabled = true;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.getElementById('underwater-container').requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    drawCaustics() {
        const time = Date.now() * 0.001;
        this.ctx.globalAlpha = 0.1;

        for (let i = 0; i < 5; i++) {
            const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * this.canvas.width;
            const y = i * (this.canvas.height / 5);

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 300);
            gradient.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
            gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.globalAlpha = 1;
    }

    update() {
        // Update fish
        this.fish.forEach(fish => {
            fish.update(this.mouse, this.canvas.width, this.canvas.height);
        });

        // Update and filter bubbles
        this.bubbles = this.bubbles.filter(bubble => {
            bubble.update();
            return bubble.life > 0;
        });

        // Update and filter particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });

        // Randomly add bubbles from bottom
        if (Math.random() < 0.05) {
            const x = Math.random() * this.canvas.width;
            this.bubbles.push(new Bubble(x, this.canvas.height));
        }
    }

    draw() {
        // Clear canvas with underwater gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a4d68');
        gradient.addColorStop(0.5, '#05364d');
        gradient.addColorStop(1, '#001a33');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw caustics
        this.drawCaustics();

        // Draw particles (ripples)
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw bubbles
        this.bubbles.forEach(bubble => bubble.draw(this.ctx));

        // Draw fish
        this.fish.forEach(fish => fish.draw(this.ctx));
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Fish class with realistic swimming behavior
class Fish {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 20 + 15;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.hue = Math.random() * 60 + 10; // Orange to yellow
        this.saturation = Math.random() * 30 + 60;
        this.lightness = Math.random() * 20 + 50;
        this.angle = Math.atan2(this.speedY, this.speedX);
        this.tailAngle = 0;
        this.tailSpeed = Math.random() * 0.1 + 0.1;

        // Personality
        this.shyness = Math.random(); // How much it avoids mouse
        this.curiosity = Math.random(); // How much it's attracted to mouse
        this.schooling = Math.random(); // How much it follows other fish
    }

    update(mouse, canvasWidth, canvasHeight) {
        // Mouse interaction
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
            // Flee from mouse if shy, or approach if curious
            const force = this.shyness > this.curiosity ? 0.5 : -0.3;
            this.speedX += (dx / distance) * force;
            this.speedY += (dy / distance) * force;
        }

        // Add some randomness (wandering behavior)
        this.speedX += (Math.random() - 0.5) * 0.2;
        this.speedY += (Math.random() - 0.5) * 0.2;

        // Limit speed
        const maxSpeed = 3;
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        if (speed > maxSpeed) {
            this.speedX = (this.speedX / speed) * maxSpeed;
            this.speedY = (this.speedY / speed) * maxSpeed;
        }

        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvasWidth) {
            this.speedX *= -1;
            this.x = Math.max(0, Math.min(canvasWidth, this.x));
        }
        if (this.y < 0 || this.y > canvasHeight) {
            this.speedY *= -1;
            this.y = Math.max(0, Math.min(canvasHeight, this.y));
        }

        // Update angle and tail animation
        this.angle = Math.atan2(this.speedY, this.speedX);
        this.tailAngle += this.tailSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Fish body
        ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        const tailSwing = Math.sin(this.tailAngle) * 0.3;
        ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness - 10}%)`;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.5, -this.size * 0.5 + tailSwing * this.size);
        ctx.lineTo(-this.size * 1.5, this.size * 0.5 + tailSwing * this.size);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.size * 0.5, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.size * 0.55, -this.size * 0.25, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Fins
        ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness - 5}%)`;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, this.size * 0.4);
        ctx.lineTo(-this.size * 0.3, this.size * 0.9);
        ctx.lineTo(this.size * 0.2, this.size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// Bubble class
class Bubble {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 3;
        this.speedY = -Math.random() * 2 - 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.life = 1;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.5;
        this.y += this.speedY;
        this.life -= 0.002;

        // Bubbles rise faster as they get bigger
        this.speedY -= 0.01;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;

        // Bubble body
        const gradient = ctx.createRadialGradient(
            this.x - this.size * 0.3,
            this.y - this.size * 0.3,
            0,
            this.x,
            this.y,
            this.size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(200, 240, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0.2)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Bubble highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// Particle class for ripple effects
class Particle {
    constructor(x, y, type = 'ripple') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = Math.random() * 3 + 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.98;
        this.speedY *= 0.98;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.5;

        if (this.type === 'ripple') {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * (1 - this.life) * 20, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// Initialize the experience when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UnderwaterExperience();
    });
} else {
    new UnderwaterExperience();
}
