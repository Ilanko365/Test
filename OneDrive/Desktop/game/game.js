const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const multiplierDisplay = document.getElementById('multiplier');
const livesDisplay = document.getElementById('lives');
const playAgainButton = document.getElementById('playAgain');

// Verify DOM
if (!canvas || !ctx || !scoreDisplay || !multiplierDisplay || !livesDisplay || !playAgainButton) {
    console.error('DOM error:', { canvas, ctx, scoreDisplay, multiplierDisplay, livesDisplay, playAgainButton });
    alert('Game setup failed. Check console.');
    throw new Error('DOM setup failed');
}

// Player (gun)
let playerX = 375; // Center
let playerY = 550;
let projectileY = -1; // Off-screen until fired
let gameOver = false;

// Input
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

document.addEventListener('keydown', (e) => {
    if (e.code in keys) {
        keys[e.code] = true;
        console.log(${e.code} pressed);
    }
    if (e.code === 'Space') e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

// Draw gun
function drawPlayer() {
    console.log('Drawing gun at:', playerX, playerY);
    ctx.fillStyle = '#888';
    ctx.fillRect(playerX + 15, playerY + 20, 20, 30);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(playerX + 22, playerY, 6, 20);
    ctx.fillStyle = '#f00';
    ctx.fillRect(playerX + 20, playerY + 30, 10, 5);
}

// Draw face
function drawFace() {
    console.log('Drawing face at: 100, 100');
    ctx.beginPath();
    ctx.arc(100 + 20, 100 + 20, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#ffeb3b';
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(100 + 12, 100 + 15, 3, 0, Math.PI * 2);
    ctx.arc(100 + 28, 100 + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.arc(100 + 20, 100 + 25, 6, 0, Math.PI); // Happy
    ctx.stroke();
    ctx.closePath();
}

// Draw projectile
function drawProjectile() {
    if (projectileY >= 0) {
        console.log('Drawing projectile at:', playerX + 22, projectileY);
        ctx.fillStyle = '#ff0';
        ctx.fillRect(playerX + 22, projectileY, 6, 15);
    }
}

// Reset
function resetGame() {
    console.log('Resetting game');
    playerX = 375;
    projectileY = -1;
    gameOver = false;
    scoreDisplay.textContent = '0';
    multiplierDisplay.textContent = '1';
    livesDisplay.textContent = '3';
    playAgainButton.style.display = 'none';
}

// Play again
playAgainButton.addEventListener('click', () => {
    console.log('Play again clicked');
    resetGame();
    gameLoop();
});

// Game loop
function gameLoop() {
    console.log('Loop running, gameOver:', gameOver);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Score: 0', canvas.width / 2, canvas.height / 2);
        playAgainButton.style.display = 'block';
        console.log('Game over screen');
        return;
    }

    // Player
    if (keys.ArrowLeft && playerX > 0) playerX -= 5;
    if (keys.ArrowRight && playerX < canvas.width - 50) playerX += 5;
    if (keys.Space && projectileY < 0) {
        projectileY = playerY;
        console.log('Firing projectile at:', playerX + 22, projectileY);
    }
    drawPlayer();

    // Face
    drawFace();

    // Projectile
    if (projectileY >= 0) {
        projectileY -= 8;
        drawProjectile();
        if (projectileY < 0) {
            projectileY = -1;
            console.log('Projectile off-screen');
        }
    }

    requestAnimationFrame(gameLoop);
}

// Initialize
try {
    console.log('Starting game');
    resetGame();
    gameLoop();
} catch (error) {
    console.error('Init error:', error);
    alert('Game failed to start. Check console.');
}