// =============================
// GoTravelUp Authentication Manager
// =============================

// Change this if backend URL changes
const API_BASE = '';

class AuthManager {
    constructor() {
        this.init();
    }

    init() {

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Referral code input (if exists)
        const referralInput = document.getElementById('referralCode');
        if (referralInput) {
            referralInput.addEventListener('blur', () => this.validateReferralCode(referralInput.value));
        }
    }

    // =============================
    // Signup Handler
    // =============================
    async handleSignup(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // ✅ Terms & Conditions check
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox || !termsCheckbox.checked) {
            alert('You must agree to the Terms & Conditions before signing up.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || 'Registration failed');
                return;
            }

            alert('Registration successful! You can now log in.');
            window.location.href = 'index.html'; // redirect to login page
        } catch (err) {
            console.error('Registration error:', err);
            alert('Error connecting to server. Please try again.');
        }
    }

    // =============================
    // Login Handler
    // =============================
    async handleLogin(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || 'Login failed');
                return;
            }

            window.location.href = 'dashboard.html';
        } catch (err) {
            console.error('Login error:', err);
            alert('Error connecting to server. Please try again.');
        }
    }

    // =============================
    // Check Auth Status (Dashboard)
    // =============================
    async checkAuthStatus() {
        try {
            const res = await fetch(`${API_BASE}/api/profile`, {
                method: 'GET',
                credentials: 'include'
            });

            if (res.ok) {
                const user = await res.json();
                this.populateDashboard(user);
            } else {
                window.location.href = 'index.html';
            }
        } catch (err) {
            console.error('Auth check error:', err);
            window.location.href = 'index.html';
        }
    }

    // =============================
    // Populate Dashboard
    // =============================
    populateDashboard(user) {
        document.getElementById('username').textContent = user.username || '';
        document.getElementById('walletAmount').textContent = user.wallet || 0;
    }

    // =============================
    // Validate Referral Code
    // =============================
    async validateReferralCode(code) {
        if (!code) return;

        try {
            const res = await fetch(`${API_BASE}/api/validate-referral`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ referralCode: code })
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || 'Invalid referral code');
            }
        } catch (err) {
            console.error('Referral validation error:', err);
        }
    }
}

// =============================
// Initialize AuthManager
// =============================
document.addEventListener('DOMContentLoaded', () => new AuthManager());
