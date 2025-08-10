// In js/app.js

/**
 * Applies the chosen theme to the document body.
 * @param {string} theme - The theme to apply ('light', 'dark', or 'auto').
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
        document.body.removeAttribute('data-theme');
    } else { // This handles 'auto'
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }
}

/**
 * Saves the user's theme preference and applies it.
 * This is called from the theme modal.
 * @param {string} theme - The theme to save.
 */
function saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

// --- INITIALIZATION LOGIC ---

// 1. Apply the theme immediately when the script loads
const savedTheme = localStorage.getItem('theme') || 'auto';
applyTheme(savedTheme);

// 2. Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('theme') || 'auto') === 'auto') {
        applyTheme('auto');
    }
});