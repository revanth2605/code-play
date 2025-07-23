// frontend/assets/js/mygames.js

(async() => {
    const container = document.getElementById('gamesList');
    const token = localStorage.getItem('cp_token');
    if (!token) {
        // Not logged in → go back to index/login
        window.location.href = 'index.html';
        return;
    }

    try {
        // Fetch all games for this user
        const res = await fetch('https://code-play-b0l6.onrender.com/api/games', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        if (!res.ok) throw new Error('Failed to fetch games');
        const games = await res.json();

        if (!games.length) {
            container.innerText = 'You haven’t saved any games yet.';
            return;
        }

        container.innerHTML = '';
        games.forEach(g => {
            const card = document.createElement('div');
            card.className = 'game-card';

            // Title
            const title = document.createElement('h3');
            title.innerText = g.title;

            // Open in Preview → savedtemplate.html?id=…
            const openBtn = document.createElement('button');
            openBtn.innerText = 'Open in Preview';
            openBtn.onclick = () => {
                window.location.href = `savedtemplate.html?id=${g._id}`;
            };

            // Play full-screen
            const playBtn = document.createElement('button');
            playBtn.innerText = 'Play';
            playBtn.onclick = () => {
                window.location.href = `viewer.html?id=${g._id}`;
            };

            card.append(title, openBtn, playBtn);
            container.append(card);
        });

    } catch (err) {
        console.error(err);
        container.innerText = 'Error loading games: ' + err.message;
    }
})();
