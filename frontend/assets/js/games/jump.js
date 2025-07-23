// Jump Adventure Game JavaScript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let score = 0;
let coins = 0;
let highScore = 0;
let gameSpeed = 2;

// Player object
const player = {
    x: 50,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    jumping: false,
    jumpPower: 0,
    grounded: false,
    color: '#e17055'
};

// Arrays for game objects
let obstacles = [];
let coinItems = [];
let clouds = [];

// Ground level
const groundLevel = canvas.height - 40;

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');

    // Reset game state
    score = 0;
    coins = 0;
    gameSpeed = 2;
    obstacles = [];
    coinItems = [];
    clouds = [];

    player.y = groundLevel - player.height;
    player.jumping = false;
    player.jumpPower = 0;
    player.grounded = true;

    // Create initial clouds
    createClouds();

    gameRunning = true;
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update score
    score += 1;
    document.getElementById('score').textContent = score;

    // Increase game speed gradually
    if (score % 500 === 0) {
        gameSpeed += 0.2;
    }

    // Update player physics
    updatePlayer();

    // Update obstacles
    updateObstacles();

    // Update coins
    updateCoins();

    // Update clouds
    updateClouds();

    // Spawn new obstacles
    if (Math.random() < 0.005 + (score * 0.000005)) {
        spawnObstacle();
    }

    // Spawn new coins
    if (Math.random() < 0.003) {
        spawnCoin();
    }

    // Check collisions
    checkCollisions();
}

function updatePlayer() {
    // Apply gravity
    if (player.jumping) {
        player.jumpPower -= 0.8;
        player.y -= player.jumpPower;

        // Check if landed
        if (player.y >= groundLevel - player.height) {
            player.y = groundLevel - player.height;
            player.jumping = false;
            player.grounded = true;
            player.jumpPower = 0;
        }
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        // Remove obstacles that are off screen
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function updateCoins() {
    for (let i = coinItems.length - 1; i >= 0; i--) {
        coinItems[i].x -= gameSpeed;
        coinItems[i].rotation += 0.1;

        // Remove coins that are off screen
        if (coinItems[i].x + coinItems[i].width < 0) {
            coinItems.splice(i, 1);
        }
    }
}

function updateClouds() {
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].x -= gameSpeed * 0.3;

        // Remove clouds that are off screen
        if (clouds[i].x + clouds[i].width < 0) {
            clouds.splice(i, 1);
        }
    }

    // Add new clouds
    if (Math.random() < 0.002) {
        clouds.push({
            x: canvas.width,
            y: Math.random() * 100 + 20,
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20
        });
    }
}

function spawnObstacle() {
    const types = ['cactus', 'rock', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];

    let obstacle = {
        x: canvas.width,
        type: type
    };

    switch (type) {
        case 'cactus':
            obstacle.y = groundLevel - 60;
            obstacle.width = 30;
            obstacle.height = 60;
            obstacle.color = '#00b894';
            break;
        case 'rock':
            obstacle.y = groundLevel - 40;
            obstacle.width = 40;
            obstacle.height = 40;
            obstacle.color = '#636e72';
            break;
        case 'bird':
            obstacle.y = groundLevel - 120;
            obstacle.width = 35;
            obstacle.height = 25;
            obstacle.color = '#fd79a8';
            obstacle.wingFlap = 0;
            break;
    }

    obstacles.push(obstacle);
}

function spawnCoin() {
    coinItems.push({
        x: canvas.width,
        y: groundLevel - 80 - (Math.random() * 60),
        width: 25,
        height: 25,
        rotation: 0
    });
}

function createClouds() {
    for (let i = 0; i < 3; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 100 + 20,
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20
        });
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#74b9ff');
    gradient.addColorStop(0.7, '#a29bfe');
    gradient.addColorStop(1, '#6c5ce7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawClouds();

    // Draw ground
    ctx.fillStyle = '#00b894';
    ctx.fillRect(0, groundLevel, canvas.width, 40);

    // Draw grass pattern
    ctx.fillStyle = '#55a3ff';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, groundLevel, 10, 5);
    }

    // Draw player
    drawPlayer();

    // Draw obstacles
    drawObstacles();

    // Draw coins
    drawCoins();
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw simple face
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 8, player.y + 8, 8, 8);
    ctx.fillRect(player.x + 24, player.y + 8, 8, 8);

    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 10, player.y + 10, 4, 4);
    ctx.fillRect(player.x + 26, player.y + 10, 4, 4);

    // Draw smile
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 15, player.y + 25, 10, 3);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;

        if (obstacle.type === 'bird') {
            // Animate bird wings
            obstacle.wingFlap += 0.3;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // Wings
            const wingOffset = Math.sin(obstacle.wingFlap) * 5;
            ctx.fillRect(obstacle.x - 10, obstacle.y + wingOffset, 15, 5);
            ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y + wingOffset, 15, 5);
        } else if (obstacle.type === 'cactus') {
            // Draw cactus with arms
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.fillRect(obstacle.x - 8, obstacle.y + 20, 15, 8);
            ctx.fillRect(obstacle.x + obstacle.width - 7, obstacle.y + 30, 15, 8);
        } else {
            // Draw regular obstacle
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });
}

function drawCoins() {
    coinItems.forEach(coin => {
        ctx.save();
        ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
        ctx.rotate(coin.rotation);

        // Draw coin
        ctx.fillStyle = '#fdcb6e';
        ctx.fillRect(-coin.width / 2, -coin.height / 2, coin.width, coin.height);

        // Draw coin center
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(-coin.width / 4, -coin.height / 4, coin.width / 2, coin.height / 2);

        ctx.restore();
    });
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);

        // Add cloud bumps
        ctx.beginPath();
        ctx.arc(cloud.x + 15, cloud.y, 15, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width - 15, cloud.y, 15, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 2, cloud.y - 10, 20, 0, Math.PI * 2);
        ctx.fill();
    });
}

function checkCollisions() {
    // Check obstacle collisions
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver();
        }
    });

    // Check coin collisions
    for (let i = coinItems.length - 1; i >= 0; i--) {
        const coin = coinItems[i];
        if (player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {

            // Collect coin
            coins += 1;
            score += 50;
            document.getElementById('coins').textContent = coins;
            coinItems.splice(i, 1);
        }
    }
}

function jump() {
    if (player.grounded && !player.jumping) {
        player.jumping = true;
        player.grounded = false;
        player.jumpPower = 15;
    }
}

function gameOver() {
    gameRunning = false;

    // Update high score
    if (score > highScore) {
        highScore = score;
    }

    document.getElementById('final-score').textContent = score;
    document.getElementById('best-score').textContent = highScore;
    document.getElementById('high-score').textContent = highScore;

    // Performance message
    let message = '';
    let emoji = '';

    if (score >= 2000) {
        message = 'Incredible! You are a Jump Master! 🏆';
        emoji = '👑';
    } else if (score >= 1000) {
        message = 'Amazing! Great jumping skills! 🌟';
        emoji = '🎉';
    } else if (score >= 500) {
        message = 'Good job! Keep practicing! 👍';
        emoji = '⭐';
    } else {
        message = 'Nice try! Jump higher next time! 💪';
        emoji = '🚀';
    }

    document.getElementById('performance-msg').textContent = message;
    document.getElementById('game-over-emoji').textContent = emoji;

    document.getElementById('game-over-screen').classList.remove('hidden');
}

function restartGame() {
    document.getElementById('game-over-screen').classList.add('hidden');
    startGame();
}

// Event listeners
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && gameRunning) {
        event.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', function() {
    if (gameRunning) {
        jump();
    }
});

// Initialize high score display
document.getElementById('high-score').textContent = highScore;