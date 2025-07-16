/**
 * Mobile Menu Toggle Functionality
 * This script handles the mobile navigation menu for all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Debug logging
    console.log('Mobile menu script loaded');
    console.log('Menu elements found:', { menuBtn, navLinks });

    if (menuBtn && navLinks) {
        // Toggle menu on button click
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Menu button clicked');
            
            navLinks.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            
            // Change icon
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fa-solid fa-times';
                console.log('Menu opened');
            } else {
                icon.className = 'fa-solid fa-bars';
                console.log('Menu closed');
            }
        });

        // Close menu when clicking outside or on overlay
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                body.style.overflow = '';
                menuBtn.querySelector('i').className = 'fa-solid fa-bars';
                console.log('Menu closed by outside click');
            }
        });

        // Close menu when clicking on close area (top right)
        navLinks.addEventListener('click', function(e) {
            const rect = navLinks.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // If clicked in top-right area (close button area)
            if (clickX > rect.width - 60 && clickY < 60) {
                navLinks.classList.remove('active');
                body.style.overflow = '';
                menuBtn.querySelector('i').className = 'fa-solid fa-bars';
                console.log('Menu closed by close button');
            }
        });

        // Handle navigation links
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function(e) {
                // Handle dropdown toggles
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();
                    const dropdown = this.closest('.dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('active');
                        console.log('Dropdown toggled');
                    }
                    return;
                }
                
                // Close menu for actual navigation links
                if (this.getAttribute('href') && this.getAttribute('href') !== '#') {
                    navLinks.classList.remove('active');
                    body.style.overflow = '';
                    menuBtn.querySelector('i').className = 'fa-solid fa-bars';
                    console.log('Menu closed by navigation');
                }
            });
        });

        // Close menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                navLinks.classList.remove('active');
                body.style.overflow = '';
                menuBtn.querySelector('i').className = 'fa-solid fa-bars';
                
                // Remove active class from all dropdowns
                const dropdowns = navLinks.querySelectorAll('.dropdown');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                body.style.overflow = '';
                menuBtn.querySelector('i').className = 'fa-solid fa-bars';
                console.log('Menu closed by escape key');
            }
        });

        // Handle touch events for better mobile experience
        let touchStartY = 0;
        navLinks.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        });

        navLinks.addEventListener('touchmove', function(e) {
            const touchY = e.touches[0].clientY;
            const deltaY = touchY - touchStartY;
            
            // If swiping up significantly, close menu
            if (deltaY < -100) {
                navLinks.classList.remove('active');
                body.style.overflow = '';
                menuBtn.querySelector('i').className = 'fa-solid fa-bars';
                console.log('Menu closed by swipe up');
            }
        });

    } else {
        console.error('Mobile menu elements not found!');
        console.log('Available elements:', {
            menuBtns: document.querySelectorAll('.menu-btn'),
            navLinks: document.querySelectorAll('.nav-links')
        });
    }
});

// Utility function to close mobile menu (can be called from other scripts)
window.closeMobileMenu = function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        body.style.overflow = '';
        if (menuBtn) {
            menuBtn.querySelector('i').className = 'fa-solid fa-bars';
        }
        console.log('Menu closed programmatically');
    }
};

// Utility function to open mobile menu
window.openMobileMenu = function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (navLinks && !navLinks.classList.contains('active')) {
        navLinks.classList.add('active');
        body.style.overflow = 'hidden';
        if (menuBtn) {
            menuBtn.querySelector('i').className = 'fa-solid fa-times';
        }
        console.log('Menu opened programmatically');
    }
};
