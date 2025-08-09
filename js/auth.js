// Good to Go - Authentication JavaScript

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
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

        // Login link in signup page
        const loginLink = document.getElementById('loginLink');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            });
        }

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhoneNumber);
        }

        // SAP ID validation
        const sapIdInput = document.getElementById('sapId');
        if (sapIdInput) {
            sapIdInput.addEventListener('input', this.validateSapId);
        }

        // Password strength indicator
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', this.checkPasswordStrength);
        }

        // Referral code validation
        const referralCodeInput = document.getElementById('referralCode');
        if (referralCodeInput) {
            referralCodeInput.addEventListener('blur', this.validateReferralCode);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const spinner = document.getElementById('signupSpinner');
        
        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Check terms acceptance
        const termsAccepted = document.getElementById('termsAccepted').checked;
        if (!termsAccepted) {
            GoodToGo.showAlert('danger', 'Please accept the terms and conditions to continue.');
            return;
        }

        // Show loading state
        const hideLoading = this.showButtonLoading(submitBtn, spinner);
        
        // Add loading overlay with message
        this.showLoadingOverlay('Please wait... Creating your account');

        try {
            // Collect form data
            const formData = new FormData(form);
            const userData = {
                name: formData.get('name').trim(),
                gender: formData.get('gender'),
                sapId: formData.get('sapId').trim().toUpperCase(),
                email: formData.get('email').trim().toLowerCase(),
                phone: formData.get('phone').trim(),
                username: formData.get('username').trim().toLowerCase(),
                password: formData.get('password'),
                referralCode: formData.get('referralCode') ? formData.get('referralCode').trim().toUpperCase() : null
            };

            // Validate data
            const validation = this.validateSignupData(userData);
            if (!validation.isValid) {
                GoodToGo.showAlert('danger', validation.message);
                hideLoading();
                return;
            }

            // Submit to server
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                // Registration successful
                this.currentUser = data.user;
                GoodToGo.showAlert('success', 'Registration successful! Redirecting to dashboard...');
                
                // Track registration
                Analytics.track('user_registered', {
                    user_id: data.user.id,
                    gender: data.user.gender,
                    sap_id: data.user.sapId
                });

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);

            } else {
                GoodToGo.showAlert('danger', data.message || 'Registration failed. Please try again.');
            }

        } catch (error) {
            console.error('Registration error:', error);
            // Check if it's a network error or server error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                GoodToGo.showAlert('danger', 'Network error. Please check your connection and try again.');
            } else if (error.name === 'SyntaxError') {
                GoodToGo.showAlert('danger', 'Server response error. Please try again.');
            } else {
                GoodToGo.showAlert('danger', error.message || 'Registration failed. Please try again.');
            }
        } finally {
            hideLoading();
            this.hideLoadingOverlay();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const spinner = document.getElementById('loginSpinner');
        
        // Show loading state
        const hideLoading = this.showButtonLoading(submitBtn, spinner);

        try {
            const formData = new FormData(form);
            const loginData = {
                username: formData.get('username').trim(),
                password: formData.get('password')
            };

            if (!loginData.username || !loginData.password) {
                GoodToGo.showAlert('danger', 'Please enter both username and password.');
                hideLoading();
                return;
            }

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                GoodToGo.showAlert('success', 'Login successful! Redirecting...');
                
                // Track login
                Analytics.track('user_logged_in', {
                    user_id: data.user.id
                });

                // Close modal and redirect
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                modal.hide();
                
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);

            } else {
                GoodToGo.showAlert('danger', data.message || 'Login failed. Please check your credentials.');
            }

        } catch (error) {
            console.error('Login error:', error);
            GoodToGo.showAlert('danger', 'Network error. Please try again.');
        } finally {
            hideLoading();
        }
    }

    validateSignupData(data) {
        // Name validation
        if (data.name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long.' };
        }

        // SAP ID validation
        if (!/^[0-9]{9}$/.test(data.sapId)) {
            return { isValid: false, message: 'SAP ID must be exactly 9 digits.' };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        // Phone validation
        const phoneRegex = /^[+]?[0-9]{10,15}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            return { isValid: false, message: 'Please enter a valid phone number.' };
        }

        // Username validation
        if (data.username.length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters long.' };
        }

        // Password validation
        if (data.password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long.' };
        }

        return { isValid: true };
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                // User is logged in
                if (window.location.pathname === '/signup') {
                    window.location.href = '/dashboard';
                }
            } else {
                // User is not logged in
                if (window.location.pathname === '/dashboard') {
                    window.location.href = '/signup';
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.startsWith('91')) {
            value = '+' + value;
        } else if (value.length === 10) {
            value = '+91 ' + value;
        }
        
        e.target.value = value;
    }

    validateSapId(e) {
        const value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 9);
        
        const isValid = value.length === 9;
        if (isValid) {
            e.target.classList.add('is-valid');
            e.target.classList.remove('is-invalid');
        } else {
            e.target.classList.add('is-invalid');
            e.target.classList.remove('is-valid');
        }
    }

    checkPasswordStrength(e) {
        const password = e.target.value;
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (!strengthIndicator) {
            // Create strength indicator if it doesn't exist
            const indicator = document.createElement('div');
            indicator.id = 'passwordStrength';
            indicator.className = 'password-strength mt-2';
            e.target.parentNode.appendChild(indicator);
        }

        let strength = 0;
        let feedback = [];

        if (password.length >= 6) strength++;
        else feedback.push('At least 6 characters');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('One uppercase letter');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('One lowercase letter');

        if (/[0-9]/.test(password)) strength++;
        else feedback.push('One number');

        if (/[^A-Za-z0-9]/.test(password)) strength++;
        else feedback.push('One special character');

        const strengthColors = ['danger', 'danger', 'warning', 'info', 'success'];
        const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

        const indicator = document.getElementById('passwordStrength');
        if (password.length > 0) {
            indicator.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-${strengthColors[strength]}">
                        Password strength: ${strengthTexts[strength]}
                    </small>
                    <div class="progress flex-fill ms-2" style="height: 5px;">
                        <div class="progress-bar bg-${strengthColors[strength]}" 
                             style="width: ${(strength + 1) * 20}%"></div>
                    </div>
                </div>
                ${feedback.length > 0 ? `<small class="text-muted">Need: ${feedback.join(', ')}</small>` : ''}
            `;
        } else {
            indicator.innerHTML = '';
        }
    }

    showButtonLoading(button, spinner) {
        const originalText = button.innerHTML;
        button.disabled = true;
        
        if (spinner) {
            spinner.classList.remove('d-none');
        }

        return () => {
            button.disabled = false;
            button.innerHTML = originalText;
            if (spinner) {
                spinner.classList.add('d-none');
            }
        };
    }

    showLoadingOverlay(message = 'Please wait...') {
        // Remove existing overlay if present
        this.hideLoadingOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 0.5rem;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <div style="color: #333; font-weight: 500;">${message}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    async validateReferralCode(e) {
        const referralCode = e.target.value.trim();
        const errorDiv = document.getElementById('referralCodeError');
        
        if (!referralCode) {
            e.target.classList.remove('is-valid', 'is-invalid');
            errorDiv.textContent = '';
            return;
        }

        try {
            const response = await fetch('/api/validate-referral', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ referralCode: referralCode.toUpperCase() })
            });

            const data = await response.json();

            if (data.success) {
                e.target.classList.add('is-valid');
                e.target.classList.remove('is-invalid');
                errorDiv.textContent = '';
                // Show success message with referrer name
                const formText = e.target.parentElement.querySelector('.form-text');
                if (formText) {
                    formText.innerHTML = `<span class="text-success"><i class="fas fa-check-circle me-1"></i>Valid code! Referred by ${data.referrerName}. You'll get ₹100 bonus credit!</span>`;
                }
            } else {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
                errorDiv.textContent = data.message || 'Invalid referral code';
                // Reset form text
                const formText = e.target.parentElement.querySelector('.form-text');
                if (formText) {
                    formText.innerHTML = 'Get bonus wallet credit when you enter a valid referral code!';
                }
            }
        } catch (error) {
            console.error('Referral validation error:', error);
            // Don't mark as invalid for network errors, just clear validation
            e.target.classList.remove('is-valid', 'is-invalid');
            errorDiv.textContent = '';
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = null;
                Analytics.track('user_logged_out');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize authentication manager
const Auth = new AuthManager();

// Make it globally available
window.Auth = Auth;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
