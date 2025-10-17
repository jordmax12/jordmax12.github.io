// Receipt Validation Showcase - Interactive Phone Theater
document.addEventListener('DOMContentLoaded', function() {
    // State
    let currentStep = 1;
    const totalSteps = 3;

    // Elements
    const screens = document.querySelectorAll('.screen-content');
    const stepDots = document.querySelectorAll('.step-dot');
    const descriptions = document.querySelectorAll('.description-content');
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');

    // Initialize
    init();

    function init() {
        // Set up event listeners
        setupNavigation();
        setupKeyboardNavigation();
        setupTouchNavigation();

        // Initial state
        updateStep(1, false);
    }

    // Navigation Setup
    function setupNavigation() {
        // Arrow buttons
        prevBtn.addEventListener('click', () => navigateStep(-1));
        nextBtn.addEventListener('click', () => navigateStep(1));

        // Step dots
        stepDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateStep(index + 1, true);
            });
        });

        // Next/Submit buttons in phone screens
        document.querySelectorAll('.next-button, .submit-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                navigateStep(1);
            });
        });

        // Back buttons in phone screens
        document.querySelectorAll('.back-button-screen').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                navigateStep(-1);
            });
        });
    }

    // Keyboard Navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateStep(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigateStep(1);
                    break;
                case '1':
                case '2':
                case '3':
                    e.preventDefault();
                    updateStep(parseInt(e.key), true);
                    break;
            }
        });
    }

    // Touch/Swipe Navigation
    function setupTouchNavigation() {
        const phoneScreen = document.querySelector('.phone-screen');
        let touchStartX = 0;
        let touchEndX = 0;
        let isDragging = false;

        phoneScreen.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            isDragging = true;
        }, { passive: true });

        phoneScreen.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
        }, { passive: true });

        phoneScreen.addEventListener('touchend', (e) => {
            if (!isDragging) return;

            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            isDragging = false;
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next
                    navigateStep(1);
                } else {
                    // Swipe right - previous
                    navigateStep(-1);
                }
            }
        }
    }

    // Navigate Steps
    function navigateStep(direction) {
        const newStep = currentStep + direction;

        if (newStep >= 1 && newStep <= totalSteps) {
            updateStep(newStep, true);
        }
    }

    // Update Step
    function updateStep(step, animate = true) {
        if (step < 1 || step > totalSteps) return;

        const prevStep = currentStep;
        currentStep = step;

        // Update screens
        screens.forEach((screen, index) => {
            const screenStep = index + 1;

            if (animate) {
                // Remove all classes first
                screen.classList.remove('active', 'prev');

                // Add appropriate class based on direction
                if (screenStep === step) {
                    // Delay to allow transition
                    setTimeout(() => {
                        screen.classList.add('active');
                    }, 50);
                } else if (screenStep < step) {
                    screen.classList.add('prev');
                }
            } else {
                screen.classList.toggle('active', screenStep === step);
            }
        });

        // Update step dots
        stepDots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === step);
        });

        // Update descriptions
        descriptions.forEach((desc, index) => {
            desc.classList.toggle('active', index + 1 === step);
        });

        // Update navigation buttons
        prevBtn.disabled = (step === 1);
        nextBtn.disabled = (step === totalSteps);

        // Animate stat cards on step change
        if (animate) {
            animateStats();
        }
    }

    // Animate Statistics
    function animateStats() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = '';
            }, 50 + (index * 100));
        });
    }

    // Entrance Animations
    function initEntranceAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe animated elements
        document.querySelectorAll('.stat-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Initialize entrance animations
    initEntranceAnimations();

    // Add pulse effect to active step dot
    setInterval(() => {
        const activeDot = document.querySelector('.step-dot.active');
        if (activeDot) {
            activeDot.style.transform = 'scale(1.1)';
            setTimeout(() => {
                activeDot.style.transform = 'scale(1)';
            }, 150);
        }
    }, 3000);

    // Prevent form submissions and default behaviors
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    document.querySelectorAll('button[disabled]').forEach(btn => {
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });

    // Initialize backend architecture animations
    initBackendArchitecture();
});

/* ============================================
   HOW IT WORKS ANIMATIONS
   ============================================ */

function initBackendArchitecture() {
    // Initialize feature card "fall-in" animations
    const featureCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a slight delay for a cascading effect
                setTimeout(() => {
                    entry.target.classList.add('fall-in');
                }, 100);
                featureCardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all feature cards and summary
    document.querySelectorAll('.feature-card, .how-it-works-summary').forEach(card => {
        featureCardObserver.observe(card);
    });
}

// Old backend architecture animation functions removed - now using simple fall-in animations

