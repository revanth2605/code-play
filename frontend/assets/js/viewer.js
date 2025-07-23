// frontend/assets/js/viewer.js
(async() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');
    const token = localStorage.getItem('cp_token');
    const titleEl = document.getElementById('gameTitle');
    const playFrame = document.getElementById('playFrame');

    if (!gameId) {
        titleEl.innerText = 'No game ID';
        return;
    }
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`https://code-play-b0l6.onrender.com/api/games/${gameId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const game = await res.json();

        // Update the header title
        titleEl.innerText = game.title;

        // Build a full HTML document for srcdoc
        const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${game.title.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</title>
  <style>
    /* you can inject any default CSS here if needed */
    body { margin:0; overflow:hidden; }
  </style>
</head>
<body>
  ${game.html}
  <script>
  // wrap user JS in an IIFE to avoid global scope conflicts
  (function(){
    ${game.javascript}
  })();
  <\/script>
</body>
</html>`;

        // Finally inject it
        playFrame.srcdoc = fullDoc;

    } catch (err) {
        console.error('Viewer error:', err);
        titleEl.innerText = 'Error loading game';
    }
})();
