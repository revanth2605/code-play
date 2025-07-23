const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    isRunning: false,
    score: 0,
    lives: 3,
    level: 1,
    fruits: [],
    basket: { x: canvas.width / 2 - 40, y: canvas.height - 60, width: 80, height: 40 }
};

const fruitTypes = ['🍎', '🍊', '🍌', '🍇', '🍓'];
const fruitPoints = { '🍎': 10, '🍊': 15, '🍌': 20, '🍇': 25, '🍓': 30 };

let animationId;
let fruitSpawnTimer = 0;

function createFruit() {
    return {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        type: fruitTypes[Math.floor(Math.random() * fruitTypes.length)],
        speed: 2 + gameState.level * 0.5
    };
}

function drawBasket() {
    // Draw basket
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(gameState.basket.x, gameState.basket.y, gameState.basket.width, gameState.basket.height);

    // Basket details
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(gameState.basket.x + i * 20, gameState.basket.y, 2, gameState.basket.height);
    }

    // Basket handle
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gameState.basket.x + gameState.basket.width / 2, gameState.basket.y - 5, 15, 0, Math.PI);
    ctx.stroke();
}

function drawFruit(fruit) {
    ctx.font = '30px Arial';
    ctx.fillText(fruit.type, fruit.x, fruit.y + 30);
}

function updateFruits() {
    for (let i = gameState.fruits.length - 1; i >= 0; i--) {
        const fruit = gameState.fruits[i];
        fruit.y += fruit.speed;

        // Check if fruit is caught
        if (fruit.y + 30 >= gameState.basket.y &&
            fruit.x + 30 >= gameState.basket.x &&
            fruit.x <= gameState.basket.x + gameState.basket.width) {

            gameState.score += fruitPoints[fruit.type];
            gameState.fruits.splice(i, 1);
            updateScore();

            // Level up every 200 points
            if (gameState.score > 0 && gameState.score % 200 === 0) {
                gameState.level++;
                updateLevel();
            }
        }
        // Check if fruit hit the ground
        else if (fruit.y > canvas.height) {
            gameState.fruits.splice(i, 1);
            gameState.lives--;
            updateLives();

            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    }
}

function spawnFruit() {
    const spawnRate = Math.max(60 - gameState.level * 10, 20);
    if (fruitSpawnTimer % spawnRate === 0) {
        gameState.fruits.push(createFruit());
    }
    fruitSpawnTimer++;
}

function draw() {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#74b9ff');
    gradient.addColorStop(1, '#a29bfe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 3; i++) {
        const x = (i * 200 + Date.now() * 0.02) % (canvas.width + 100);
        ctx.beginPath();
        ctx.arc(x, 50, 20, 0, Math.PI * 2);
        ctx.arc(x + 20, 50, 30, 0, Math.PI * 2);
        ctx.arc(x + 40, 50, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw ground
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    drawBasket();
    gameState.fruits.forEach(drawFruit);
}

function gameLoop() {
    if (!gameState.isRunning) return;

    spawnFruit();
    updateFruits();
    draw();

    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = {
        isRunning: true,
        score: 0,
        lives: 3,
        level: 1,
        fruits: [],
        basket: { x: canvas.width / 2 - 40, y: canvas.height - 60, width: 80, height: 40 }
    };

    fruitSpawnTimer = 0;
    updateScore();
    updateLives();
    updateLevel();

    document.getElementById('startBtn').textContent = '🔄 RESTART';
    gameLoop();
}

function gameOver() {
    gameState.isRunning = false;
    cancelAnimationFrame(animationId);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Click START to play again!', canvas.width / 2, canvas.height / 2 + 50);

    ctx.textAlign = 'left';
    document.getElementById('startBtn').textContent = '🎮 START GAME';
}

function moveBasket(direction) {
    if (!gameState.isRunning) return;

    const speed = 25;
    if (direction === 'left' && gameState.basket.x > 0) {
        gameState.basket.x -= speed;
    } else if (direction === 'right' && gameState.basket.x < canvas.width - gameState.basket.width) {
        gameState.basket.x += speed;
    }
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function updateLives() {
    document.getElementById('lives').textContent = gameState.lives;
}

function updateLevel() {
    document.getElementById('level').textContent = gameState.level;
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            moveBasket('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            moveBasket('right');
            break;
        case ' ':
            e.preventDefault();
            if (!gameState.isRunning) startGame();
            break;
    }
});

// Initialize with background
draw();