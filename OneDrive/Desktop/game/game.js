// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const multiplierDisplay = document.getElementById('multiplier');
const livesDisplay = document.getElementById('lives');
const playAgainButton = document.getElementById('playAgain');

// Verify DOM elements
if (!canvas || !ctx || !scoreDisplay || !multiplierDisplay || !livesDisplay || !playAgainButton) {
    console.error('Missing DOM elements:', { canvas, ctx, scoreDisplay, multiplierDisplay, livesDisplay, playAgainButton });
    alert('Game setup failed. Check console.');
    throw new Error('DOM setup failed');
}

// Game state
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 30,
    speed: 5
};

let projectiles = [];
let targets = [];
let score = 0;
let multiplier = 1;
let lives = 3;
let gameOver = false;
let lastShot = false;
const basePoints = 10;
let speedMultiplier = 1.0;

// Input handling
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

document.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

// Projectile class
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 20;
        this.speed = 7;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Target class
class Target {
    constructor() {
        this.x = Math.random() * (canvas.width - 40);
        this.y = 0;
        this.radius = 20;
        this.speed = (1 + Math.random() * 2) * speedMultiplier; // 1–3 pixels/frame
        console.log('Target created at:', this.x, this.y, 'Speed:', this.speed);
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.closePath();
    }
}

// Spawn targets
function spawnTarget() {
    if (!gameOver) {
        targets.push(new Target());
        console.log('Target spawned, total:', targets.length);
    }
}

// Collision detection
function checkCollision(rect1, circle) {
    const closestX = Math.max(rect1.x, Math.min(circle.x + circle.radius, rect1.x + rect1.width));
    const closestY = Math.max(rect1.y, Math.min(circle.y + circle.radius, rect1.y + rect1.height));
    const distanceX = (circle.x + circle.radius) - closestX;
    const distanceY = (circle.y + circle.radius) - closestY;
    return (distanceX ** 2 + distanceY ** 2) <= circle.radius ** 2;
}

// Reset game
function resetGame() {
    console.log('Resetting game');
    score = 0;
    multiplier = 1;
    lives = 3;
    gameOver = false;
    speedMultiplier = 1.0;
    projectiles = [];
    targets = [];
    player.x = canvas.width / 2 - 25;
    lastShot = false;
    scoreDisplay.textContent = score;
    multiplierDisplay.textContent = multiplier;
    livesDisplay.textContent = lives;
    playAgainButton.style.display = 'none';
    spawnTarget();
}

// Play again button
playAgainButton.addEventListener('click', () => {
    resetGame();
    gameLoop();
});

// Speed increase
setInterval(() => {
    if (!gameOver) {
        speedMultiplier = Math.min(speedMultiplier + 0.1, 2.0);
        console.log('Speed multiplier:', speedMultiplier);
    }
}, 10000);

// Game loop
function gameLoop() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Score: ' + score, canvas.width / 2, canvas.height / 2);
        playAgainButton.style.display = 'block';
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys.Space && !lastShot) {
        projectiles.push(new Projectile(player.x + player.width / 2 - 5, player.y));
        console.log('Projectile fired');
        lastShot = true;
        setTimeout(() => lastShot = false, 200);
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Projectiles
    projectiles = projectiles.filter(p => {
        p.update();
        p.draw();
        return p.y >= 0;
    });

    // Targets
    targets = targets.filter(t => {
        t.update();
        t.draw();
        if (t.y > canvas.height) {
            multiplier = 1;
            multiplierDisplay.textContent = multiplier;
            lives--;
            livesDisplay.textContent = lives;
            console.log('Target missed, lives:', lives);
            if (lives <= 0) gameOver = true;
            return false;
        }
        return true;
    });

    // Collisions
    for (let i = targets.length - 1; i >= 0; i--) {
        for (let j = projectiles.length - 1; j >= 0; j--) {
            if (checkCollision(projectiles[j], targets[i])) {
                score += basePoints * multiplier;
                multiplier++;
                scoreDisplay.textContent = score;
                multiplierDisplay.textContent = multiplier;
                console.log('Hit! Score:', score, 'Multiplier:', multiplier);
                targets.splice(i, 1);
                projectiles.splice(j, 1);
                break;
            }
        }
    }

    console.log('Frame - Targets:', targets.length, 'Projectiles:', projectiles.length);
    requestAnimationFrame(gameLoop);
}

// Initialize
try {
    resetGame();
    setInterval(spawnTarget, 1000);
    gameLoop();
    console.log('Game initialized');
} catch (error) {
    console.error('Init error:', error);
    alert('Game failed to start. Check console.');
}
