// frontend/assets/js/editor.js

document.addEventListener('DOMContentLoaded', () => {
    // ──────────────── AUTH CHECK ────────────────
    const token = localStorage.getItem('cp_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Grab DOM elements
    const titleInput = document.getElementById('gameTitle');
    const tplSelect = document.getElementById('templateSelect');
    const htmlTextarea = document.getElementById('htmlCode');
    const jsTextarea = document.getElementById('jsCode');
    const previewFrame = document.getElementById('previewFrame');
    const statusEl = document.getElementById('status');
    const runBtn = document.getElementById('runBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Detect if editing an existing game
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');

    if (gameId) {
        // ─────────────── LOAD & UPDATE FLOW ───────────────
        document.querySelector('h2').innerText = 'Edit Your Game';
        tplSelect.style.display = 'none'; // hide template chooser

        fetch(`https://code-play-b0l6.onrender.com/api/games/${gameId}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load game');
                return res.json();
            })
            .then(game => {
                // populate fields from DB
                titleInput.value = game.title;
                htmlTextarea.value = game.html;
                jsTextarea.value = game.javascript;

                // switch button text
                saveBtn.innerText = 'Update Game';

                // add a Play button
                const playBtn = document.createElement('button');
                playBtn.innerText = 'Play';
                playBtn.style.marginLeft = '0.5rem';
                playBtn.addEventListener('click', () => {
                    window.location.href = `viewer.html?id=${gameId}`;
                });
                saveBtn.parentNode.insertBefore(playBtn, saveBtn.nextSibling);

                // update handler
                saveBtn.addEventListener('click', async e => {
                    e.preventDefault();
                    statusEl.style.color = 'black';
                    statusEl.innerText = 'Updating…';
                    try {
                        const res = await fetch(`http://localhost:4000/api/games/${gameId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({
                                title: titleInput.value.trim(),
                                html: htmlTextarea.value,
                                javascript: jsTextarea.value
                            })
                        });
                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.error || res.statusText);
                        }
                        statusEl.style.color = 'green';
                        statusEl.innerText = '✅ Updated successfully!';
                    } catch (err) {
                        console.error(err);
                        statusEl.style.color = 'red';
                        statusEl.innerText = '❌ ' + err.message;
                    }
                });
            })
            .catch(err => {
                console.error(err);
                statusEl.style.color = 'red';
                statusEl.innerText = 'Error loading game for edit.';
            });

    } else {
        // ─────────────── NEW GAME / TEMPLATE FLOW ───────────────

        // 1) If ?template=… is in the URL, pre-select
        const tplKey = params.get('template');
        if (tplKey) {
            tplSelect.value = tplKey;
        }

        // 2) Default templates
        const TEMPLATES = {
            catch: {
                html: `<!DOCTYPE html>
<html>
  <body>
    <canvas id="gameCanvas" width="600" height="400"></canvas>
    <script src="catch.js"></script>
  </body>
</html>`,
                js: `// Catch the Fruit Game Template
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// … rest of catch.js logic …`
            },
            maze: {
                html: `<!DOCTYPE html>
<html>
  <body>
    <canvas id="gameCanvas" width="600" height="400"></canvas>
    <script src="maze.js"></script>
  </body>
</html>`,
                js: `// Maze Runner Game Template
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// … rest of maze.js logic …`
            },
            jump: {
                html: `<!DOCTYPE html>
<html>
  <body>
    <canvas id="gameCanvas" width="600" height="400"></canvas>
    <script src="jump.js"></script>
  </body>
</html>`,
                js: `// Jump Adventure Game Template
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// … rest of jump.js logic …`
            },
            math: {
                html: `<!DOCTYPE html>
<html>
  <body>
    <div id="game">
      <h2>Math Quiz</h2>
      <p id="question">Click start…</p>
      <input id="answer" type="number" /><br/>
      <button id="submitBtn">Submit</button><button id="startBtn">Start</button>
      <p id="score">Score: 0</p>
    </div>
    <script src="math.js"></script>
  </body>
</html>`,
                js: `// Math Quiz Template
let level=1,score=0,correct=0;
function startGame(){ /*…*/ }
function nextQuestion(){ /*…*/ }
function submitAnswer(){ /*…*/ }
function updateScore(){ /*…*/ }
window.addEventListener("DOMContentLoaded",()=>{ /* wire buttons */ });`
            },
            tictactoe: {
                html: `<!DOCTYPE html>
<html>
  <body>
    <table id="board">…</table>
    <script src="tictactoe.js"></script>
  </body>
</html>`,
                js: `// Tic-Tac-Toe Template
const boardEl = document.getElementById("board");
// … rest of tictactoe.js logic …`
            }
        };

        // 3) When template dropdown changes
        tplSelect.addEventListener('change', () => {
            const sel = tplSelect.value;
            if (!TEMPLATES[sel]) {
                htmlTextarea.value = '';
                jsTextarea.value = '';
                previewFrame.srcdoc = '';
                return;
            }
            htmlTextarea.value = TEMPLATES[sel].html;
            jsTextarea.value = TEMPLATES[sel].js;
            runPreview();
        });

        // 4) Live preview
        function runPreview() {
            previewFrame.srcdoc = `
${htmlTextarea.value}
<script>
${jsTextarea.value}
<\/script>
`;
        }
        runBtn.addEventListener('click', runPreview);

        // 5) Save new game
        saveBtn.addEventListener('click', async e => {
            e.preventDefault();
            const title = titleInput.value.trim();
            if (!title) {
                statusEl.style.color = 'red';
                statusEl.innerText = '❌ Please enter a title before saving.';
                return;
            }
            statusEl.style.color = 'black';
            statusEl.innerText = 'Saving…';
            try {
                const res = await fetch('http://localhost:4000/api/games', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        title,
                        html: htmlTextarea.value,
                        javascript: jsTextarea.value
                    })
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || res.statusText);
                }
                const data = await res.json();
                statusEl.style.color = 'green';
                statusEl.innerText = `✅ Saved! ID=${data._id}`;
            } catch (err) {
                console.error(err);
                statusEl.style.color = 'red';
                statusEl.innerText = `❌ Error: ${err.message}`;
            }
        });
    }

    // Cancel button (shared by both flows)
    cancelBtn.addEventListener('click', () => {
        titleInput.value = '';
        tplSelect.value = '';
        htmlTextarea.value = '';
        jsTextarea.value = '';
        previewFrame.srcdoc = '';
        statusEl.innerText = '';
    });
});
