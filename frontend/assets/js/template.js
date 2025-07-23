// frontend/assets/js/template.js

document.addEventListener('DOMContentLoaded', async() => {
    // 1) Get the "game" key from URL, e.g. ?game=catch
    const key = new URL(window.location.href).searchParams.get('game');
    const VALID = ['catch', 'maze', 'jump', 'math', 'tictactoe'];

    // 2) Grab UI elements
    const titleEl = document.getElementById('gameTitle');
    const htmlEl = document.getElementById('htmlCode');
    const jsEl = document.getElementById('jsCode');
    const preview = document.getElementById('preview');
    const runBtn = document.getElementById('runBtn');
    const editorLink = document.getElementById('editorLink');

    // 3) Validate key
    if (!VALID.includes(key)) {
        titleEl.innerText = 'Unknown game template';
        htmlEl.value = '';
        jsEl.value = '';
        runBtn.disabled = true;
        return;
    }

    // 4) Show the title
    const TITLES = {
        catch: "Catch the Fruit",
        maze: "Maze Runner",
        jump: "Jump Adventure",
        math: "Math Quiz",
        tictactoe: "Tic-Tac-Toe"
    };
    titleEl.innerText = TITLES[key];

    try {
        // 5) Fetch full HTML and JS files
        const [htmlResp, jsResp] = await Promise.all([
            fetch(`assets/templates/${key}.html`),
            fetch(`assets/js/games/${key}.js`)
        ]);

        if (!htmlResp.ok) throw new Error(`HTML not found (${htmlResp.status})`);
        if (!jsResp.ok) throw new Error(`JS not found (${jsResp.status})`);

        const [htmlText, jsText] = await Promise.all([
            htmlResp.text(),
            jsResp.text()
        ]);

        // 6) Populate code panes
        htmlEl.value = htmlText;
        jsEl.value = jsText;

        // 7) Update “Edit in Editor” link
        editorLink.href = `./editor.html?template=${key}`;

        // 8) Define how to render preview
        const runPreview = () => {
            preview.srcdoc = `
${htmlText}
<script>
${jsText}
<\/script>
`;
        };

        // 9) Wire up Run button
        runBtn.disabled = false;
        runBtn.addEventListener('click', runPreview);

        // 10) Initial render
        runPreview();

    } catch (err) {
        console.error(err);
        htmlEl.value = `ERROR: ${err.message}`;
        jsEl.value = '';
        runBtn.disabled = true;
    }
});