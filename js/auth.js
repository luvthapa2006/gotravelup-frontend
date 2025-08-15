// =============================
// UNISCAPE Authentication Manager
// =============================

const API_BASE = 'https://gotravelup-backend.onrender.com';

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        // Find and attach to signup form if it exists
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Find and attach to login form if it exists
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    // --- Signup Handler ---
    async handleSignup(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.spinner-border');
        const buttonText = button.querySelector('.button-text');

        if (!button || !spinner || !buttonText) return; // Safety check

        const originalButtonText = buttonText.textContent;

        // Show loading state
        button.disabled = true;
        spinner.classList.remove('d-none');
        buttonText.textContent = 'Creating Account...';

        try {
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox || !termsCheckbox.checked) {
                alert('You must agree to the Terms & Conditions before signing up.');
                throw new Error("Terms not accepted"); // Stop execution
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                alert('Registration successful! You can now log in.');
                window.location.href = 'signin.html'; // Go to signin page
            } else {
                alert(result.message || 'Registration failed.');
                // Reset button on failure
                button.disabled = false;
                spinner.classList.add('d-none');
                buttonText.textContent = originalButtonText;
            }
        } catch (err) {
            if (err.message !== "Terms not accepted") {
               console.error('Registration error:', err);
               alert('An error occurred. Please try again.');
            }
            // Reset button on any error
            button.disabled = false;
            spinner.classList.add('d-none');
            buttonText.textContent = originalButtonText;
        }
    }

    // --- Login Handler ---
    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.spinner-border');
        const buttonText = button.querySelector('.button-text');

        if (!button || !spinner || !buttonText) return; // Safety check

        const originalButtonText = buttonText.textContent;

        // Show loading state
        button.disabled = true;
        spinner.classList.remove('d-none');
        buttonText.textContent = 'Logging In...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                window.location.href = 'dashboard.html'; // Go to dashboard
            } else {
                alert(result.message || 'Login failed.');
                // Reset button on failure
                button.disabled = false;
                spinner.classList.add('d-none');
                buttonText.textContent = originalButtonText;
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('An error occurred. Please try again.');
            // Reset button on error
            button.disabled = false;
            spinner.classList.add('d-none');
            buttonText.textContent = originalButtonText;
        }
    }
}

// Initialize the AuthManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => new AuthManager());