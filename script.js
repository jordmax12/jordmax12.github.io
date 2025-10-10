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

    // Add subtle hover effects to experience and project items
    const experienceItems = document.querySelectorAll('.experience-item, .project-item');
    
    experienceItems.forEach(item => {
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
