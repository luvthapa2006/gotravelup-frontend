// Good to Go - Main Application JavaScript

// Global app object
const GoodToGo = {
    init: function() {
        this.showSplashScreen();
        this.setupEventListeners();
    },

    showSplashScreen: function() {
        // Show splash screen for 3 seconds, then fade out
        setTimeout(() => {
            const splashScreen = document.getElementById('splashScreen');
            const mainContent = document.getElementById('mainContent');
            
            if (splashScreen && mainContent) {
                splashScreen.style.animation = 'fadeOut 1s ease-out forwards';
                mainContent.style.animation = 'fadeIn 1s ease-out forwards';
                mainContent.style.opacity = '1';
            }
        }, 3000);
    },

    setupEventListeners: function() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', this.handleNavbarScroll);

        // Form enhancements
        this.enhanceForms();

        // Animation on scroll
        this.setupScrollAnimations();
    },

    handleNavbarScroll: function() {
        const navbar = document.querySelector('.navbar');
        if (navbar && window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
            navbar.style.backgroundColor = 'rgba(0, 123, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else if (navbar) {
            navbar.classList.remove('navbar-scrolled');
            navbar.style.backgroundColor = 'transparent';
            navbar.style.backdropFilter = 'none';
        }
    },

    enhanceForms: function() {
        // Add bootstrap validation classes
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    if (this.checkValidity()) {
                        this.classList.add('is-valid');
                        this.classList.remove('is-invalid');
                    } else {
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                    }
                });
            });
        });
    },

    setupScrollAnimations: function() {
        const animatedElements = document.querySelectorAll('.feature-card, .destination-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.transition = 'all 0.6s ease-out';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    },

    // Utility functions
    showAlert: function(type, message, duration = 5000) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertContainer.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertContainer.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertContainer);

        // Auto dismiss
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.classList.remove('show');
                setTimeout(() => {
                    if (alertContainer.parentNode) {
                        alertContainer.parentNode.removeChild(alertContainer);
                    }
                }, 150);
            }
        }, duration);
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    formatDate: function(dateString) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    },

    validateForm: function(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        return isValid;
    },

    showLoading: function(button) {
        const spinner = button.querySelector('.spinner-border');
        const originalText = button.textContent;
        
        if (spinner) {
            spinner.classList.remove('d-none');
        }
        
        button.disabled = true;
        button.setAttribute('data-original-text', originalText);
        
        return () => {
            if (spinner) {
                spinner.classList.add('d-none');
            }
            button.disabled = false;
            button.textContent = originalText;
        };
    },

    hideLoading: function(button) {
        const spinner = button.querySelector('.spinner-border');
        const originalText = button.getAttribute('data-original-text');
        
        if (spinner) {
            spinner.classList.add('d-none');
        }
        
        button.disabled = false;
        if (originalText) {
            button.textContent = originalText;
        }
    },

    // API helper functions
    api: {
        baseUrl: 'https://gotravelup-backend.onrender.com',

        async request(endpoint, options = {}) {
            const url = `${this.baseUrl}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            try {
                const response = await fetch(url, config);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Request failed');
                }
                
                return data;
            } catch (error) {
                console.error('API request error:', error);
                throw error;
            }
        },

        async get(endpoint) {
            return this.request(endpoint);
        },

        async post(endpoint, data) {
            return this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        async put(endpoint, data) {
            return this.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        async delete(endpoint) {
            return this.request(endpoint, {
                method: 'DELETE'
            });
        }
    }
};

// Analytics helper
const Analytics = {
    track: function(event, properties = {}) {
        // Placeholder for analytics tracking
        console.log('Track event:', event, properties);
        
        // Example: send to analytics service
        // gtag('event', event, properties);
    },

    page: function(pageName) {
        this.track('page_view', { page: pageName });
    }
};

// Performance monitoring
const Performance = {
    mark: function(name) {
        if ('performance' in window) {
            performance.mark(name);
        }
    },

    measure: function(name, startMark, endMark) {
        if ('performance' in window) {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        }
    },

    init: function() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    console.log('Page Load Performance:', {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        load: navigation.loadEventEnd - navigation.loadEventStart,
                        total: navigation.loadEventEnd - navigation.fetchStart
                    });
                }
            }, 0);
        });
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle button listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Set toggle state based on saved theme
        themeToggle.checked = localStorage.getItem('theme') === 'dark';

        themeToggle.addEventListener('change', function () {
            const theme = this.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }
});




// Export for use in other scripts
window.GoodToGo = GoodToGo;
window.Analytics = Analytics;
