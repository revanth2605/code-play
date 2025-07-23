// Tic Tac Toe Game JavaScript
let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

let currentPlayer = 'X';
let gameActive = true;
let scores = {
    X: 0,
    O: 0,
    draw: 0
};

function makeMove(row, col) {
    if (board[row][col] === '' && gameActive) {
        board[row][col] = currentPlayer;

        const cellIndex = row * 3 + col;
        const cells = document.querySelectorAll('.cell');
        cells[cellIndex].textContent = currentPlayer;
        cells[cellIndex].classList.add(currentPlayer.toLowerCase());

        if (checkWinner()) {
            endGame(`Player ${currentPlayer} Wins! 🎉`);
            scores[currentPlayer]++;
            updateScoreBoard();
        } else if (checkDraw()) {
            endGame("It's a Draw! 🤝");
            scores.draw++;
            updateScoreBoard();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateCurrentPlayer();
        }
    }
}

function checkWinner() {
    // Check rows
    for (let row = 0; row < 3; row++) {
        if (board[row][0] === board[row][1] &&
            board[row][1] === board[row][2] &&
            board[row][0] !== '') {
            highlightWinningCells([row * 3, row * 3 + 1, row * 3 + 2]);
            return true;
        }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
        if (board[0][col] === board[1][col] &&
            board[1][col] === board[2][col] &&
            board[0][col] !== '') {
            highlightWinningCells([col, col + 3, col + 6]);
            return true;
        }
    }

    // Check diagonals
    if (board[0][0] === board[1][1] &&
        board[1][1] === board[2][2] &&
        board[0][0] !== '') {
        highlightWinningCells([0, 4, 8]);
        return true;
    }

    if (board[0][2] === board[1][1] &&
        board[1][1] === board[2][0] &&
        board[0][2] !== '') {
        highlightWinningCells([2, 4, 6]);
        return true;
    }

    return false;
}

function checkDraw() {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === '') {
                return false;
            }
        }
    }
    return true;
}

function highlightWinningCells(indices) {
    const cells = document.querySelectorAll('.cell');
    indices.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function endGame(message) {
    gameActive = false;
    const statusElement = document.getElementById('game-status');
    statusElement.innerHTML = `<div class="emoji">🎊</div><div class="winner">${message}</div>`;

    setTimeout(() => {
        newRound();
    }, 3000);
}

function updateCurrentPlayer() {
    const playerElement = document.getElementById('current-player');
    playerElement.textContent = `Player ${currentPlayer}'s Turn`;
}

function updateScoreBoard() {
    document.getElementById('score-x').textContent = scores.X;
    document.getElementById('score-o').textContent = scores.O;
    document.getElementById('score-draw').textContent = scores.draw;
}

function newRound() {
    board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];

    currentPlayer = 'X';
    gameActive = true;

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    updateCurrentPlayer();
    document.getElementById('game-status').innerHTML = '<div class="emoji">🎯</div>';
}

function resetGame() {
    newRound();
    scores = {
        X: 0,
        O: 0,
        draw: 0
    };
    updateScoreBoard();
}

// Initialize the game
updateCurrentPlayer();
updateScoreBoard();