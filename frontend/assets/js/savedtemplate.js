// frontend/assets/js/savedtemplate.js

document.addEventListener('DOMContentLoaded', async() => {
    const params = new URLSearchParams(location.search);
    const gameId = params.get('id');
    const token = localStorage.getItem('cp_token');
    const titleEl = document.getElementById('gameTitle');
    const htmlEl = document.getElementById('htmlCode');
    const jsEl = document.getElementById('jsCode');
    const preview = document.getElementById('preview');
    const runBtn = document.getElementById('runBtn');

    if (!gameId) {
        titleEl.innerText = 'No game ID';
        runBtn.disabled = true;
        return;
    }
    if (!token) {
        location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`http://localhost:4000/api/games/${gameId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const game = await res.json();

        titleEl.innerText = game.title;
        htmlEl.value = game.html;
        jsEl.value = game.javascript;

        function runPreview() {
            preview.srcdoc = `
${game.html}
<script>
${game.javascript}
<\/script>
`;
        }

        runBtn.addEventListener('click', runPreview);
        runPreview();

    } catch (err) {
        console.error(err);
        titleEl.innerText = 'Error loading game';
        runBtn.disabled = true;
    }
});