// Math Quiz Game JavaScript
let score = 0;
let lives = 3;
let currentAnswer = 0;
let questionCount = 0;

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    generateQuestion();
}

function generateQuestion() {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2;

    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            currentAnswer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 20) + 10;
            num2 = Math.floor(Math.random() * num1) + 1;
            currentAnswer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            currentAnswer = num1 * num2;
            break;
    }

    document.getElementById('question').textContent = `${num1} ${operation} ${num2} = ?`;
    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const feedback = document.getElementById('feedback');

    if (isNaN(userAnswer)) {
        feedback.textContent = "Please enter a number! 🤔";
        feedback.className = "feedback wrong";
        return;
    }

    if (userAnswer === currentAnswer) {
        score += 10;
        feedback.textContent = "Correct! Great job! 🎉";
        feedback.className = "feedback correct";
        questionCount++;

        setTimeout(() => {
            generateQuestion();
            document.getElementById('feedback').textContent = '';
        }, 1500);
    } else {
        lives--;
        feedback.textContent = `Wrong! The answer was ${currentAnswer} 😔`;
        feedback.className = "feedback wrong";

        if (lives <= 0) {
            setTimeout(endGame, 1500);
        } else {
            setTimeout(() => {
                generateQuestion();
                document.getElementById('feedback').textContent = '';
            }, 1500);
        }
    }

    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

function endGame() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;

    let message = "";
    let emoji = "";

    if (score >= 100) {
        message = "Amazing! You're a Math Genius! 🧠";
        emoji = "🏆";
    } else if (score >= 50) {
        message = "Great job! You're getting better! 👍";
        emoji = "⭐";
    } else {
        message = "Keep practicing! You can do it! 💪";
        emoji = "🌟";
    }

    document.getElementById('performance-message').textContent = message;
    document.getElementById('final-emoji').textContent = emoji;
}

function restartGame() {
    score = 0;
    lives = 3;
    questionCount = 0;

    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');

    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Allow Enter key to submit answer
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !document.getElementById('game-screen').classList.contains('hidden')) {
        checkAnswer();
    }
});