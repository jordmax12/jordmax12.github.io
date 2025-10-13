// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    const body = document.body;

    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        themeIcon.textContent = '🌙';
    } else {
        // Default to dark mode
        themeIcon.textContent = '☀️';
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-theme');

        if (body.classList.contains('light-theme')) {
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });

    // Fade-in animation for resume sections
    const sections = document.querySelectorAll('.resume-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });

    // Enhanced Horizontal Timeline Functionality
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineTrack = document.getElementById('timeline-track');
    const prevBtn = document.getElementById('timeline-prev');
    const nextBtn = document.getElementById('timeline-next');
    const progressBar = document.getElementById('timeline-progress');
    const yearIndicators = document.querySelectorAll('.year-indicator');
    const autoplayToggle = document.getElementById('autoplay-toggle');

    let currentIndex = 0;
    let isAutoplay = false;
    let autoplayInterval;

    // Calculate item width including gap
    function getItemWidth() {
        const item = timelineItems[0];
        const styles = window.getComputedStyle(item);
        const width = item.offsetWidth;
        const marginRight = parseInt(styles.marginRight) || 0;
        return width + marginRight + 40; // 40px is the gap
    }

    // Create infinite loop by duplicating timeline items
    function createInfiniteLoop() {
        const trackContainer = timelineTrack;
        const originalItems = Array.from(timelineItems);

        // Clone all timeline items and append them for seamless looping
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.remove('active');
            trackContainer.appendChild(clone);
        });

        // Update the timelineItems NodeList to include clones
        window.allTimelineItems = trackContainer.querySelectorAll('.timeline-item');
    }

    // Update timeline position
    function updateTimeline(index, smooth = true) {
        if (index < 0 || index >= timelineItems.length) return;

        currentIndex = index;
        const itemWidth = getItemWidth();
        const offset = -index * itemWidth;

        if (smooth) {
            timelineTrack.style.transition = 'transform 0.5s ease';
        } else {
            timelineTrack.style.transition = 'none';
        }

        timelineTrack.style.transform = `translateX(${offset}px)`;

        // Update progress bar
        const progress = ((index + 1) / timelineItems.length) * 100;
        progressBar.style.width = `${progress}%`;

        // Progress overlay removed

        // Timeline segments removed

        // Update navigation buttons
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === timelineItems.length - 1;

        // Update active states
        timelineItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        yearIndicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    // Navigation event listeners
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            updateTimeline(currentIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < timelineItems.length - 1) {
            updateTimeline(currentIndex + 1);
        }
    });

    // Year indicator clicks
    yearIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            updateTimeline(index);
        });
    });

    // Timeline dot clicks (now handled within timeline items)
    timelineItems.forEach((item, index) => {
        const dot = item.querySelector('.timeline-dot');
        if (dot) {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                updateTimeline(index);
            });
        }
    });

    // Autoplay functionality
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (currentIndex < timelineItems.length - 1) {
                updateTimeline(currentIndex + 1);
            } else {
                updateTimeline(0); // Loop back to start
            }
        }, 4000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    autoplayToggle.addEventListener('click', () => {
        isAutoplay = !isAutoplay;
        const icon = autoplayToggle.querySelector('span:first-child');

        if (isAutoplay) {
            startAutoplay();
            icon.textContent = '⏸️';
            autoplayToggle.classList.add('active');
        } else {
            stopAutoplay();
            icon.textContent = '▶️';
            autoplayToggle.classList.remove('active');
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (currentIndex > 0) updateTimeline(currentIndex - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentIndex < timelineItems.length - 1) updateTimeline(currentIndex + 1);
                break;
            case ' ':
                e.preventDefault();
                autoplayToggle.click();
                break;
        }
    });

    // Touch/swipe support for mobile
    let startX = 0;
    let isDragging = false;

    timelineTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    timelineTrack.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });

    timelineTrack.addEventListener('touchend', (e) => {
        if (!isDragging) return;

        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0 && currentIndex < timelineItems.length - 1) {
                updateTimeline(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                updateTimeline(currentIndex - 1);
            }
        }

        isDragging = false;
    });

    // Expand/collapse functionality (preserved from original)
    timelineItems.forEach(item => {
        const expandButton = item.querySelector('.timeline-expand');
        const details = item.querySelector('.timeline-details');

        if (expandButton && details) {
            expandButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent timeline navigation
                const isExpanded = item.classList.contains('expanded');

                if (isExpanded) {
                    item.classList.remove('expanded');
                    details.classList.remove('expanded');
                } else {
                    item.classList.add('expanded');
                    details.classList.add('expanded');
                }
            });
        }

        // Removed individual dot handling since dots are now separate

        // Timeline item click to navigate
        item.addEventListener('click', function() {
            const index = Array.from(timelineItems).indexOf(item);
            updateTimeline(index);
        });
    });

    // Initialize timeline
    updateTimeline(0, false);

    // Handle window resize
    window.addEventListener('resize', () => {
        updateTimeline(currentIndex, false);
    });

    // Timeline container entrance animation
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineContainerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    if (timelineContainer) {
        timelineContainer.style.opacity = 0;
        timelineContainer.style.transform = 'translateY(30px)';
        timelineContainer.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        timelineContainerObserver.observe(timelineContainer);
    }

    // Add subtle hover effects to project items
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px var(--shadow)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });

        // Add transition for smooth hover effect
        item.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
});
