// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game elements
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const bestScoreElement = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreElement = document.getElementById('finalScore');
const newRecordElement = document.getElementById('newRecord');
const playAgainBtn = document.getElementById('playAgainBtn');

// Game settings
const GRAVITY = 0.8;
const JUMP_STRENGTH = -15;
const GROUND_Y = canvas.height - 40;

// Game state
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 4;
let score = 0;
let lives = 3;
let bestScore = localStorage.getItem('maizeRunnerBest') || 0;
let gameLoop;

// Player object
const player = {
    x: 80,
    y: GROUND_Y - 60,
    width: 30,
    height: 60,
    velocityY: 0,
    jumping: false,
    color: '#8B4513'
};

// Game arrays
let obstacles = [];
let collectibles = [];
let backgroundElements = [];

// Initialize game
function init() {
    bestScoreElement.textContent = bestScore;
    generateBackground();
    drawGame();
}

// Generate scrolling background
function generateBackground() {
    backgroundElements = [];
    for (let i = 0; i < 15; i++) {
        backgroundElements.push({
            x: i * 60,
            y: GROUND_Y,
            height: Math.random() * 80 + 100,
            type: 'corn'
        });
    }
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#90EE90');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moving clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const cloudX = (Date.now() * 0.02) % (canvas.width + 100) - 50;
    drawCloud(cloudX, 30);
    drawCloud(cloudX + 200, 50);

    // Background corn stalks
    backgroundElements.forEach(element => {
        drawCornStalk(element.x, element.y, element.height, true);

        // Move background elements
        element.x -= gameSpeed * 0.3;
        if (element.x < -30) {
            element.x = canvas.width + Math.random() * 50;
            element.height = Math.random() * 80 + 100;
        }
    });

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    // Grass on ground
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 10) {
        const grassHeight = Math.sin(i * 0.1 + Date.now() * 0.003) * 2 + 4;
        ctx.fillRect(i, GROUND_Y - grassHeight, 6, grassHeight);
    }
}

// Draw cloud
function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.arc(x + 20, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 35, y, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Draw corn stalk
function drawCornStalk(x, y, height, isBackground = false) {
    ctx.save();
    if (isBackground) {
        ctx.globalAlpha = 0.5;
    }

    // Stalk
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x - 3, y - height, 6, height);

    // Corn ears
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x - 6, y - height + 20, 12, 25);

    // Leaves
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(x - 8, y - height + 15, 16, 8);

    ctx.restore();
}

// Draw player
function drawPlayer() {
    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, GROUND_Y + 5, player.width / 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player body
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player head
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 8, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 4, player.y - 10, 2, 0, Math.PI * 2);
    ctx.arc(player.x + player.width / 2 + 4, player.y - 10, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 4, player.y - 10, 1, 0, Math.PI * 2);
    ctx.arc(player.x + player.width / 2 + 4, player.y - 10, 1, 0, Math.PI * 2);
    ctx.fill();

    // Simple arms and legs animation
    const time = Date.now() * 0.01;
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 3;

    // Arms
    ctx.beginPath();
    ctx.moveTo(player.x + 5, player.y + 15);
    ctx.lineTo(player.x + Math.sin(time) * 5, player.y + 25);
    ctx.moveTo(player.x + player.width - 5, player.y + 15);
    ctx.lineTo(player.x + player.width + Math.sin(time + Math.PI) * 5, player.y + 25);
    ctx.stroke();

    // Legs
    if (!player.jumping) {
        ctx.beginPath();
        ctx.moveTo(player.x + 8, player.y + player.height);
        ctx.lineTo(player.x + 8 + Math.sin(time * 2) * 6, player.y + player.height + 10);
        ctx.moveTo(player.x + player.width - 8, player.y + player.height);
        ctx.lineTo(player.x + player.width - 8 + Math.sin(time * 2 + Math.PI) * 6, player.y + player.height + 10);
        ctx.stroke();
    }
}

// Generate obstacles
function generateObstacle() {
    if (Math.random() < 0.012) {
        const types = ['rock', 'log'];
        const type = types[Math.floor(Math.random() * types.length)];

        obstacles.push({
            x: canvas.width,
            y: GROUND_Y - 30,
            width: 35,
            height: 30,
            type: type
        });
    }
}

// Generate collectibles
function generateCollectible() {
    if (Math.random() < 0.008) {
        collectibles.push({
            x: canvas.width,
            y: GROUND_Y - 60,
            width: 20,
            height: 25,
            collected: false,
            animation: 0
        });
    }
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'rock') {
            // Draw rock
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2,
                obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Rock texture
            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + obstacle.width / 2 - 5, obstacle.y + obstacle.height / 2 - 3,
                3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (obstacle.type === 'log') {
            // Draw log
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // Log rings
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(obstacle.x + 8, obstacle.y + obstacle.height / 2, 6, 0, Math.PI * 2);
            ctx.arc(obstacle.x + obstacle.width - 8, obstacle.y + obstacle.height / 2, 6, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

// Draw collectibles
function drawCollectibles() {
    collectibles.forEach(collectible => {
        if (collectible.collected) return;

        collectible.animation += 0.1;
        const bounce = Math.sin(collectible.animation) * 3;

        // Golden corn
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(collectible.x, collectible.y + bounce, collectible.width, collectible.height);

        // Corn leaves
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(collectible.x - 2, collectible.y + bounce - 3, collectible.width + 4, 6);

        // Glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(collectible.x, collectible.y + bounce, collectible.width, collectible.height);
        ctx.shadowBlur = 0;
    });
}

// Update player
function updatePlayer() {
    if (player.jumping) {
        player.velocityY += GRAVITY;
        player.y += player.velocityY;

        // Land on ground
        if (player.y >= GROUND_Y - player.height) {
            player.y = GROUND_Y - player.height;
            player.jumping = false;
            player.velocityY = 0;
        }
    }
}

// Update obstacles
function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    // Remove obstacles that are off screen
    obstacles = obstacles.filter(obstacle => obstacle.x > -obstacle.width);
}

// Update collectibles
function updateCollectibles() {
    collectibles.forEach(collectible => {
        collectible.x -= gameSpeed;
    });

    // Remove collectibles that are off screen
    collectibles = collectibles.filter(collectible => collectible.x > -collectible.width);
}

// Check collisions
function checkCollisions() {
    // Check obstacle collisions
    obstacles.forEach((obstacle, index) => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {

            // Player hit obstacle
            lives--;
            livesElement.textContent = lives;

            // Remove obstacle
            obstacles.splice(index, 1);

            // Screen flash effect
            canvas.style.filter = 'brightness(2) hue-rotate(0deg)';
            setTimeout(() => {
                canvas.style.filter = 'none';
            }, 150);

            if (lives <= 0) {
                gameOver();
            }
        }
    });

    // Check collectible collisions
    collectibles.forEach(collectible => {
        if (!collectible.collected &&
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y) {

            collectible.collected = true;
            score += 10;
            scoreElement.textContent = score;

            // Collection effect
            canvas.style.filter = 'brightness(1.5) saturate(1.5)';
            setTimeout(() => {
                canvas.style.filter = 'none';
            }, 100);
        }
    });
}

// Update game
function updateGame() {
    if (!gameRunning || gamePaused) return;

    updatePlayer();
    updateObstacles();
    updateCollectibles();

    // Generate new objects
    generateObstacle();
    generateCollectible();

    // Check collisions
    checkCollisions();

    // Increase score over time
    score += 1;
    scoreElement.textContent = score;

    // Gradually increase speed
    gameSpeed += 0.002;
}

// Draw everything
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlayer();
    drawObstacles();
    drawCollectibles();
}

// Main game loop
function gameLoopFunction() {
    updateGame();
    drawGame();

    if (gameRunning) {
        requestAnimationFrame(gameLoopFunction);
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning || gamePaused) return;

    if ((e.code === 'Space' || e.code === 'ArrowUp') && !player.jumping) {
        player.jumping = true;
        player.velocityY = JUMP_STRENGTH;
        e.preventDefault();
    }
}

// Jump function for touch/click
function jump() {
    if (gameRunning && !gamePaused && !player.jumping) {
        player.jumping = true;
        player.velocityY = JUMP_STRENGTH;
    }
}

// Start game
function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gamePaused = false;
    gameSpeed = 4;
    score = 0;
    lives = 3;

    // Reset player
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    player.jumping = false;

    // Clear arrays
    obstacles = [];
    collectibles = [];

    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    startBtn.textContent = '🎮 Running...';
    gameOverModal.style.display = 'none';

    gameLoopFunction();
}

// Pause/resume game
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        pauseBtn.textContent = '▶️ Resume';
    } else {
        pauseBtn.textContent = '⏸️ Pause';
        gameLoopFunction();
    }
}

// Reset game
function resetGame() {
    gameRunning = false;
    gamePaused = false;

    // Reset player
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    player.jumping = false;

    // Reset game state
    score = 0;
    lives = 3;
    gameSpeed = 4;
    obstacles = [];
    collectibles = [];

    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = '🚀 Start Game';
    pauseBtn.textContent = '⏸️ Pause';
    gameOverModal.style.display = 'none';

    drawGame();
}

// Game over
function gameOver() {
    gameRunning = false;
    gamePaused = false;

    // Check for new best score
    let isNewRecord = false;
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('maizeRunnerBest', bestScore);
        isNewRecord = true;
    }

    // Show game over modal
    finalScoreElement.textContent = score;
    newRecordElement.style.display = isNewRecord ? 'block' : 'none';
    gameOverModal.style.display = 'block';

    // Reset buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = '🚀 Start Game';
    pauseBtn.textContent = '⏸️ Pause';
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Touch controls for mobile
canvas.addEventListener('touchstart', (e) => {
    jump();
    e.preventDefault();
});

canvas.addEventListener('click', jump);

// Initialize game
init();