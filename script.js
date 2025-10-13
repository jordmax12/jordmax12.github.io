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
    const backToLatestBtn = document.getElementById('back-to-latest');
    let currentIndex = 0;

    // Calculate item width including gap
    function getItemWidth() {
        const item = timelineItems[0];
        const styles = window.getComputedStyle(item);
        const width = item.offsetWidth;
        const marginRight = parseInt(styles.marginRight) || 0;
        return width + marginRight + 40; // 40px is the gap
    }

    // Create seamless back-and-forth scrolling
    function createSeamlessScrolling() {
        // Add event listeners to timeline items
        addTimelineEventListeners();

        // Track scrolling direction
        window.scrollDirection = 1; // 1 for forward, -1 for backward
        window.isReversing = false;
    }

    // Update timeline position with back-and-forth scrolling
    function updateTimeline(index, smooth = true) {
        const originalLength = timelineItems.length;

        // Ensure index is within bounds
        if (index < 0) index = 0;
        if (index >= originalLength) index = originalLength - 1;

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
        const progress = ((index + 1) / originalLength) * 100;
        progressBar.style.width = `${progress}%`;

        // Navigation buttons are always enabled
        prevBtn.disabled = false;
        nextBtn.disabled = false;

        // Update active states
        timelineItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        yearIndicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Show/hide back to latest button
        updateBackToLatestButton(index);
    }

    // Update back to latest button visibility
    function updateBackToLatestButton(index) {
        if (index === 0) {
            // Hide button when on the latest (first) position
            backToLatestBtn.classList.remove('visible');
        } else {
            // Show button when not on the latest position
            backToLatestBtn.classList.add('visible');
        }
    }

    // Removed infinite loop transition handling

    // Navigation event listeners with back-and-forth scrolling
    prevBtn.addEventListener('click', () => {
        const newIndex = currentIndex - 1;
        if (newIndex < 0) {
            // At the beginning, go to the end
            updateTimeline(timelineItems.length - 1);
        } else {
            updateTimeline(newIndex);
        }
    });

    nextBtn.addEventListener('click', () => {
        const newIndex = currentIndex + 1;
        if (newIndex >= timelineItems.length) {
            // At the end, go back to the beginning
            updateTimeline(0);
        } else {
            updateTimeline(newIndex);
        }
    });

    // Year indicator clicks
    yearIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            updateTimeline(index);
        });
    });

    // Back to latest button click
    backToLatestBtn.addEventListener('click', () => {
        updateTimeline(0); // Go back to the first (latest) position
    });

    // Function to add event listeners to timeline items using event delegation
    function addTimelineEventListeners() {
        // Use event delegation on the timeline track
        timelineTrack.addEventListener('click', function(e) {
            const timelineItem = e.target.closest('.timeline-item');
            if (!timelineItem) return;

            // Handle expand button clicks
            if (e.target.closest('.timeline-expand')) {
                e.stopPropagation();
                const details = timelineItem.querySelector('.timeline-details');
                const isExpanded = timelineItem.classList.contains('expanded');

                if (isExpanded) {
                    timelineItem.classList.remove('expanded');
                    details.classList.remove('expanded');
                } else {
                    timelineItem.classList.add('expanded');
                    details.classList.add('expanded');
                }
                return;
            }

            // Handle timeline item navigation - much simpler now
            const itemIndex = Array.from(timelineItems).indexOf(timelineItem);
            if (itemIndex !== -1) {
                updateTimeline(itemIndex);
            }
        });
    }

    // Removed autoplay functionality

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevBtn.click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextBtn.click();
                break;
            // Removed spacebar autoplay toggle
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
            if (diff > 0) {
                nextBtn.click();
            } else if (diff < 0) {
                prevBtn.click();
            }
        }

        isDragging = false;
    });

    // Event listeners are now handled by addTimelineEventListeners() function

    // Initialize timeline with seamless scrolling
    createSeamlessScrolling();
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
