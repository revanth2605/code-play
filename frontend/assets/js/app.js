// frontend/assets/js/app.js

document.addEventListener('DOMContentLoaded', function() {
    var frame = document.getElementById('game-frame');
    var brand = document.querySelector('.navbar__brand');
    var templatesLink = document.querySelector('.navbar__menu a[href="index.html"]');

    function launchTemplate(filename) {
        if (!frame) {
            console.error('No iframe#game-frame found');
            return;
        }
        frame.src = 'assets/js/games/' + filename;
        frame.style.display = 'block';
        frame.scrollIntoView({ behavior: 'smooth' });
    }

    function hideTemplate() {
        if (!frame) return;
        frame.style.display = 'none';
        frame.src = '';
    }

    // Expose globally for inline onclick
    window.launchTemplate = launchTemplate;

    // Hide when clicking brand/logo or templates link
    if (brand) brand.addEventListener('click', hideTemplate);
    if (templatesLink) templatesLink.addEventListener('click', hideTemplate);

    // Hide when clicking anywhere outside the iframe but within .cards or navbar
    document.addEventListener('click', function(e) {
        // if click is inside the iframe, do nothing
        if (e.target.closest('#game-frame')) return;

        // if click is inside the cards container or the navbar, hide the iframe
        if (e.target.closest('.cards') || e.target.closest('.navbar')) {
            hideTemplate();
        }
    });
});