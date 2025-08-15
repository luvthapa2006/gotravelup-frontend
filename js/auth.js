// =============================
// UNISCAPE Authentication Manager (Enhanced)
// =============================

const API_BASE = 'https://gotravelup-backend.onrender.com';

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            this.setupSignupValidation(signupForm);
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }
    
    // --- NEW: SIGNUP FORM VALIDATION LOGIC ---
    setupSignupValidation(form) {
        const nameInput = form.querySelector('#name');
        const sapIdInput = form.querySelector('#sapId');
        const usernameInput = form.querySelector('#username');
        const passwordInput = form.querySelector('#password');
        const createAccountBtn = form.querySelector('#createAccountBtn');
        
        const criteria = {
            length: form.querySelector('#charLength'),
            letter: form.querySelector('#hasLetter'),
            number: form.querySelector('#hasNumber'),
            special: form.querySelector('#hasSpecial'),
        };

        const allInputs = form.querySelectorAll('input[required], select[required]');

        // Function to generate the username
        const generateUsername = () => {
            const name = nameInput.value.trim().toLowerCase().replace(/[^a-z]/g, '');
            const sap = sapIdInput.value.trim();
            if (name.length >= 4 && sap.length === 9) {
                usernameInput.value = name.substring(0, 4) + sap.substring(5, 9);
            } else {
                usernameInput.value = '';
            }
        };

        // Function to validate the password in real-time
        const validatePassword = () => {
            const pass = passwordInput.value;
            // Criteria
            const hasLength = pass.length >= 8;
            const hasLetter = /[a-zA-Z]/.test(pass);
            const hasNumber = /[0-9]/.test(pass);
            const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

            criteria.length.classList.toggle('valid', hasLength);
            criteria.letter.classList.toggle('valid', hasLetter);
            criteria.number.classList.toggle('valid', hasNumber);
            criteria.special.classList.toggle('valid', hasSpecial);

            return hasLength && hasLetter && hasNumber && hasSpecial;
        };

        // Function to check if the entire form is valid
        const checkFormValidity = () => {
            let isFormValid = true;
            allInputs.forEach(input => {
                if (!input.checkValidity()) {
                    isFormValid = false;
                }
            });
            const isPasswordValid = validatePassword();
            return isFormValid && isPasswordValid;
        };
        
        // Add event listeners to all inputs
        form.addEventListener('input', () => {
             // Specific actions for certain fields
            if (event.target === nameInput || event.target === sapIdInput) {
                generateUsername();
            }
            if (event.target === passwordInput) {
                validatePassword();
            }
            // Check overall validity and update button state
            if (checkFormValidity()) {
                createAccountBtn.disabled = false;
            } else {
                createAccountBtn.disabled = true;
            }
        });
    }

// --- Signup Handler ---
    async handleSignup(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('#createAccountBtn');
        const spinner = button.querySelector('.spinner-border');
        const buttonText = button.querySelector('.button-text');

        if (!button || !spinner || !buttonText) return;

        const originalButtonText = buttonText.textContent;
        button.disabled = true;
        spinner.classList.remove('d-none');
        buttonText.textContent = 'Creating Account...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // ✅ ADD THIS LINE to prepend "+91" to the phone number
            data.phone = "+91" + data.phone;

            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                alert('Registration successful! You can now log in.');
                window.location.href = 'signin.html';
            } else {
                throw new Error(result.message || 'Registration failed.');
            }
        } catch (err) {
            alert(err.message);
            button.disabled = false;
            spinner.classList.add('d-none');
            buttonText.textContent = originalButtonText;
        }
    }

    // --- Login Handler (Unchanged) ---
    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.spinner-border');
        const buttonText = button.querySelector('.button-text');

        if (!button || !spinner || !buttonText) return;

        const originalButtonText = buttonText.textContent;
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
                window.location.href = 'dashboard.html';
            } else {
                throw new Error(result.message || 'Login failed.');
            }
        } catch (err) {
            alert(err.message);
            button.disabled = false;
            spinner.classList.add('d-none');
            buttonText.textContent = originalButtonText;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new AuthManager());