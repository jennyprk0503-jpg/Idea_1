/**
 * MINI-MAP MODULE
 *
 * Renders a top-down view of the room with:
 * - Player position (blue arrow/dot)
 * - Treasure chest (black square)
 * - Fish (small moving dots)
 * - Room boundaries
 */

export class MiniMap {
    constructor(camera, fishSchool, treasureChest, roomSize) {
        this.camera = camera;
        this.fishSchool = fishSchool;
        this.treasureChest = treasureChest;
        this.roomSize = roomSize;

        // Canvas setup
        this.canvas = document.getElementById('minimap');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size to match CSS size with device pixel ratio
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.width = rect.width;
        this.height = rect.height;

        // Scale factor (world units to canvas pixels)
        this.scale = this.width / this.roomSize;

        // Colors
        this.colors = {
            background: 'rgba(0, 20, 40, 0.95)',
            roomBorder: 'rgba(100, 200, 255, 0.6)',
            player: '#64c8ff',
            playerDirection: '#ffffff',
            treasure: '#000000',
            treasureOutline: '#ffd700',
            fish: 'rgba(100, 200, 255, 0.8)',
            grid: 'rgba(100, 200, 255, 0.1)'
        };
    }

    /**
     * Convert world coordinates to mini-map coordinates
     */
    worldToMap(worldX, worldZ) {
        const x = (worldX / this.roomSize + 0.5) * this.width;
        const y = (worldZ / this.roomSize + 0.5) * this.height;
        return { x, y };
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Draw room boundaries
     */
    drawRoom() {
        // Grid lines
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;

        const gridSize = 10; // World units
        const gridStep = (gridSize / this.roomSize) * this.width;

        for (let i = 0; i <= this.roomSize / gridSize; i++) {
            const offset = i * gridStep;

            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(offset, 0);
            this.ctx.lineTo(offset, this.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, offset);
            this.ctx.lineTo(this.width, offset);
            this.ctx.stroke();
        }

        // Room border
        this.ctx.strokeStyle = this.colors.roomBorder;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(2, 2, this.width - 4, this.height - 4);
    }

    /**
     * Draw player position and direction
     */
    drawPlayer() {
        const pos = this.worldToMap(this.camera.position.x, this.camera.position.z);

        // Player dot
        this.ctx.fillStyle = this.colors.player;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Direction indicator (arrow)
        const rotation = this.camera.rotation.y;
        const arrowLength = 12;

        const dirX = Math.sin(rotation) * arrowLength;
        const dirY = Math.cos(rotation) * arrowLength;

        this.ctx.strokeStyle = this.colors.playerDirection;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x + dirX, pos.y + dirY);
        this.ctx.stroke();

        // Arrow head
        const arrowHeadSize = 4;
        const angle1 = rotation + Math.PI * 0.8;
        const angle2 = rotation - Math.PI * 0.8;

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x + dirX, pos.y + dirY);
        this.ctx.lineTo(
            pos.x + dirX + Math.sin(angle1) * arrowHeadSize,
            pos.y + dirY + Math.cos(angle1) * arrowHeadSize
        );
        this.ctx.moveTo(pos.x + dirX, pos.y + dirY);
        this.ctx.lineTo(
            pos.x + dirX + Math.sin(angle2) * arrowHeadSize,
            pos.y + dirY + Math.cos(angle2) * arrowHeadSize
        );
        this.ctx.stroke();

        // Player glow/pulse
        const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
        this.ctx.strokeStyle = this.colors.player;
        this.ctx.globalAlpha = pulse * 0.3;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw treasure chest location
     */
    drawTreasure() {
        if (!this.treasureChest) return;

        const treasurePos = this.treasureChest.getPosition();
        const pos = this.worldToMap(treasurePos.x, treasurePos.z);

        const size = 8;

        // Draw differently if chest is open
        if (this.treasureChest.isOpen) {
            // Open chest - draw as empty square
            this.ctx.strokeStyle = this.colors.treasureOutline;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);
        } else {
            // Closed chest - draw filled square with glow
            this.ctx.fillStyle = this.colors.treasure;
            this.ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);

            // Gold outline
            this.ctx.strokeStyle = this.colors.treasureOutline;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);

            // Pulsing glow
            const pulse = Math.sin(Date.now() * 0.002) * 0.4 + 0.6;
            this.ctx.strokeStyle = this.colors.treasureOutline;
            this.ctx.globalAlpha = pulse * 0.4;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(pos.x - size, pos.y - size, size * 2, size * 2);
            this.ctx.globalAlpha = 1;
        }
    }

    /**
     * Draw fish positions
     */
    drawFish() {
        if (!this.fishSchool) return;

        const fishPositions = this.fishSchool.getPositions();

        this.ctx.fillStyle = this.colors.fish;

        fishPositions.forEach(fishPos => {
            const pos = this.worldToMap(fishPos.x, fishPos.z);

            // Small dot for each fish
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /**
     * Main update and render function
     */
    update() {
        this.clear();
        this.drawRoom();
        this.drawFish();
        this.drawTreasure();
        this.drawPlayer();
    }

    /**
     * Resize handler
     */
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.width = rect.width;
        this.height = rect.height;
        this.scale = this.width / this.roomSize;
    }
}
