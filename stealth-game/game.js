const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- CONFIG & CONSTANTS ---
const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    UPGRADE: 'UPGRADE',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN'
};

const COLORS = {
    cyan: '#00e5ff',
    magenta: '#ff0055',
    lime: '#39ff14',
    yellow: '#ffff00',
    bg: '#08080f'
};

// --- CLASSES ---

class Particle {
    constructor(x, y, color, speed = 2) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * speed * 2;
        this.vy = (Math.random() - 0.5) * speed * 2;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, type = 'STATIC') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 20;
        this.color = COLORS.magenta;
        this.angle = Math.random() * Math.PI * 2;
        this.visionRange = 250;
        this.visionAngle = Math.PI / 4;
        this.lastShot = 0;
        this.state = 'IDLE'; // IDLE, ALERT
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.speed = type === 'PATROLLER' ? 2 : 0;
    }

    update() {
        if (this.state === 'IDLE') {
            if (this.type === 'PATROLLER' && this.patrolPoints.length > 0) {
                const target = this.patrolPoints[this.currentPatrolIndex];
                const dist = Math.hypot(target.x - this.x, target.y - this.y);

                if (dist < 5) {
                    this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
                } else {
                    const angleToTarget = Math.atan2(target.y - this.y, target.x - this.x);
                    let diff = angleToTarget - this.angle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    this.angle += diff * 0.05;

                    this.x += Math.cos(this.angle) * this.speed;
                    this.y += Math.sin(this.angle) * this.speed;
                }
            } else if (this.type === 'STATIC') {
                this.angle += 0.01;
            }
        }

        // Detection Logic
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (distToPlayer < this.visionRange * player.visibility) {
            const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            let diff = angleToPlayer - this.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            if (Math.abs(diff) < this.visionAngle) {
                if (!isLineObstructed(this.x, this.y, player.x, player.y)) {
                    this.state = 'ALERT';
                    this.angle = angleToPlayer;
                    this.shoot();
                } else {
                    this.state = 'IDLE';
                }
            } else {
                this.state = 'IDLE';
            }
        } else {
            this.state = 'IDLE';
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > 1500 - (level * 50)) {
            bullets.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(this.angle) * 8,
                vy: Math.sin(this.angle) * 8,
                radius: 4,
                color: COLORS.yellow
            });
            this.lastShot = now;
        }
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.visionRange * player.visibility);
        gradient.addColorStop(0, this.state === 'ALERT' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 0, 85, 0.2)');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.visionRange * player.visibility, this.angle - this.visionAngle, this.angle + this.visionAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillRect(this.radius - 8, -2, 10, 4);
        ctx.restore();
    }
}

// --- UTILS ---

function isLineObstructed(x1, y1, x2, y2) {
    for (const obs of obstacles) {
        if (lineRectIntersect(x1, y1, x2, y2, obs.x, obs.y, obs.w, obs.h)) return true;
    }
    return false;
}

function lineRectIntersect(x1, y1, x2, y2, rx, ry, rw, rh) {
    if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
    if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;
    return lineLineIntersect(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
           lineLineIntersect(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh) ||
           lineLineIntersect(x1, y1, x2, y2, rx, ry, rx, ry + rh) ||
           lineLineIntersect(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
}

function lineLineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (den === 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// --- GLOBALS ---
let currentState = GameState.MENU;
let score = 0;
let level = 1;
let xp = 0;
let xpToNextLevel = 100;
let shakeAmount = 0;
let flashAlpha = 0;

const player = {
    x: 100,
    y: 100,
    radius: 18,
    color: COLORS.cyan,
    speed: 5,
    angle: 0,
    health: 100,
    maxHealth: 100,
    visibility: 1.0,
    upgrades: {
        speed: 1,
        stealth: 1,
        health: 1
    }
};

let enemies = [];
let obstacles = [];
let bullets = [];
let particles = [];

const keys = {};

const UPGRADES = [
    { id: 'speed', name: 'OVERCLOCK', desc: 'Increase movement speed by 15%', action: () => player.speed *= 1.15 },
    { id: 'stealth', name: 'GHOST MASK', desc: 'Reduce detection range by 20%', action: () => player.upgrades.stealth *= 0.8 },
    { id: 'health', name: 'CORE REPAIR', desc: 'Repair 50% health & increase max', action: () => { player.maxHealth += 20; player.health = Math.min(player.maxHealth, player.health + player.maxHealth * 0.5); } },
    { id: 'vision', name: 'SENSOR ARRAY', desc: 'Wider vision field for the ghost', action: () => { player.radius *= 1.1; } }
];

// --- INITIALIZATION ---
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('next-level-btn').addEventListener('click', () => { level++; initLevel(); currentState = GameState.PLAYING; hideOverlays(); });

function startGame() {
    score = 0;
    level = 1;
    xp = 0;
    xpToNextLevel = 100;
    player.maxHealth = 100;
    player.health = 100;
    player.speed = 5;
    player.upgrades.stealth = 1.0;
    initLevel();
    currentState = GameState.PLAYING;
    hideOverlays();
}

function hideOverlays() {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
}

function initLevel() {
    player.x = 100;
    player.y = 100;
    enemies = [];
    obstacles = [];
    bullets = [];
    particles = [];

    // Obstacles
    const obsCount = Math.min(15, 6 + level);
    for (let i = 0; i < obsCount; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 250) + 150,
            y: Math.random() * (canvas.height - 250) + 150,
            w: Math.random() * 100 + 50,
            h: Math.random() * 100 + 50
        });
    }

    // Enemies
    const enemyCount = 2 + level;
    for (let i = 0; i < enemyCount; i++) {
        const type = Math.random() > 0.4 ? 'PATROLLER' : 'STATIC';
        const enemy = new Enemy(
            Math.random() * (canvas.width - 100) + 50,
            Math.random() * (canvas.height - 100) + 50,
            type
        );
        if (type === 'PATROLLER') {
            enemy.patrolPoints = [
                { x: enemy.x, y: enemy.y },
                { x: Math.random() * canvas.width, y: Math.random() * canvas.height }
            ];
        }
        enemies.push(enemy);
    }
    updateUI();
}

function update() {
    if (currentState !== GameState.PLAYING) return;
    if (shakeAmount > 0) shakeAmount *= 0.9;
    if (flashAlpha > 0) flashAlpha -= 0.02;

    let dx = 0, dy = 0;
    if (keys['KeyW']) dy -= 1;
    if (keys['KeyS']) dy += 1;
    if (keys['KeyA']) dx -= 1;
    if (keys['KeyD']) dx += 1;

    if (dx !== 0 || dy !== 0) {
        const mag = Math.sqrt(dx*dx + dy*dy);
        dx /= mag; dy /= mag;
        player.visibility = (keys['ShiftLeft'] ? 0.4 : 1.0) * player.upgrades.stealth;
        const currentSpeed = keys['ShiftLeft'] ? player.speed * 0.5 : player.speed;
        const nextX = player.x + dx * currentSpeed;
        const nextY = player.y + dy * currentSpeed;
        if (!checkWallCollision(nextX, nextY, player.radius)) { player.x = nextX; player.y = nextY; }
        player.angle = Math.atan2(dy, dx);
    } else {
        player.visibility = 0.2 * player.upgrades.stealth;
    }

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    enemies.forEach((enemy, index) => {
        enemy.update();
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.radius + enemy.radius + 10) killEnemy(index);
    });

    for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); if (particles[i].life <= 0) particles.splice(i, 1); }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (Math.hypot(player.x - b.x, player.y - b.y) < player.radius + b.radius) { playerDamage(20); bullets.splice(i, 1); continue; }
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height || isPointInObstacle(b.x, b.y)) bullets.splice(i, 1);
    }
}

function checkWallCollision(x, y, r) {
    for (const obs of obstacles) if (x + r > obs.x && x - r < obs.x + obs.w && y + r > obs.y && y - r < obs.y + obs.h) return true;
    return false;
}

function isPointInObstacle(x, y) {
    for (const obs of obstacles) if (x > obs.x && x < obs.x + obs.w && y > obs.y && y < obs.y + obs.h) return true;
    return false;
}

function killEnemy(index) {
    const enemy = enemies[index];
    for (let i = 0; i < 15; i++) particles.push(new Particle(enemy.x, enemy.y, COLORS.magenta, 3));
    enemies.splice(index, 1);
    score++;
    shakeAmount = 10;
    addXP(40);
    document.getElementById('score-display').textContent = `TERMINATIONS: ${score.toString().padStart(2, '0')}`;
    if (enemies.length === 0) winLevel();
}

function playerDamage(amt) {
    player.health -= amt;
    shakeAmount = 20;
    flashAlpha = 0.5;
    for (let i = 0; i < 10; i++) particles.push(new Particle(player.x, player.y, player.color, 2));
    updateUI();
    if (player.health <= 0) gameOver();
}

function addXP(amt) {
    xp += amt;
    if (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        xpToNextLevel += 20;
        showUpgradeScreen();
    }
    updateUI();
}

function updateUI() {
    document.getElementById('health-bar').style.width = (player.health / player.maxHealth * 100) + '%';
    document.getElementById('xp-bar').style.width = (xp / xpToNextLevel * 100) + '%';
    document.getElementById('level-display').textContent = `NODE: ${level.toString().padStart(2, '0')}`;
}

function showUpgradeScreen() {
    currentState = GameState.UPGRADE;
    const container = document.getElementById('upgrade-options');
    container.innerHTML = '';
    const choices = UPGRADES.sort(() => 0.5 - Math.random()).slice(0, 3);
    choices.forEach(upg => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `<div class="upgrade-name">${upg.name}</div><div class="upgrade-desc">${upg.desc}</div>`;
        card.onclick = () => { upg.action(); currentState = GameState.PLAYING; hideOverlays(); updateUI(); };
        container.appendChild(card);
    });
    document.getElementById('upgrade-overlay').classList.remove('hidden');
}

function winLevel() {
    currentState = GameState.WIN;
    document.getElementById('win-overlay').classList.remove('hidden');
}

function gameOver() {
    currentState = GameState.GAME_OVER;
    document.getElementById('final-score').textContent = `Terminations: ${score}`;
    document.getElementById('game-over-overlay').classList.remove('hidden');
}

function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (shakeAmount > 1) ctx.translate(Math.random() * shakeAmount - shakeAmount/2, Math.random() * shakeAmount - shakeAmount/2);

    // Grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    obstacles.forEach(obs => { ctx.fillStyle = '#1a1a2e'; ctx.fillRect(obs.x, obs.y, obs.w, obs.h); ctx.strokeStyle = COLORS.cyan; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h); });
    particles.forEach(p => p.draw(ctx));
    bullets.forEach(b => { ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill(); });
    enemies.forEach(enemy => enemy.draw(ctx));

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.shadowBlur = 20; ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.globalAlpha = player.visibility;
    ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white'; ctx.fillRect(player.radius - 5, -2, 8, 4);
    ctx.restore();

    ctx.restore();

    if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (currentState === GameState.PLAYING) update();
    requestAnimationFrame(draw);
}

draw();
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
