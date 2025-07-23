// frontend/assets/js/auth.js

const Auth = (() => {
    let mode; // 'login' or 'register'

    async function submit() {
        const statusEl = document.getElementById('status');
        let payload = {};
        let endpoint;

        if (mode === 'login') {
            // login only needs email & password
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            if (!email || !password) {
                statusEl.style.color = 'red';
                statusEl.innerText = 'Email and password are required.';
                return;
            }
            payload = { email, password };
            endpoint = '/api/auth/login';
            statusEl.style.color = 'black';
            statusEl.innerText = 'Logging in…';

        } else if (mode === 'register') {
            // register needs firstName, lastName, email & password
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!firstName || !lastName || !email || !password) {
                statusEl.style.color = 'red';
                statusEl.innerText = 'All fields are required.';
                return;
            }
            payload = { firstName, lastName, email, password };
            endpoint = '/api/auth/register';
            statusEl.style.color = 'black';
            statusEl.innerText = 'Registering…';

        } else {
            console.error('Auth mode not set');
            return;
        }

        try {
            const res = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);

            // store JWT
            localStorage.setItem('cp_token', data.token);

            statusEl.style.color = 'green';
            statusEl.innerText = 'Success! Redirecting…';

            // redirect based on mode
            setTimeout(() => {
                if (mode === 'login') {
                    window.location.href = 'home.html';
                } else {
                    window.location.href = 'index.html'; // back to login after register
                }
            }, 800);

        } catch (err) {
            console.error('Auth error:', err);
            statusEl.style.color = 'red';
            statusEl.innerText = '❌ ' + err.message;
        }
    }

    function init(opts) {
        mode = opts.mode; // should be 'login' or 'register'
        const btnId = mode === 'login' ? 'loginBtn' : 'registerBtn';
        document.getElementById(btnId)
            .addEventListener('click', submit);
    }

    return { init };
})();