/**
 * CONTACT.JS
 * Contact form handling
 */

/**
 * Initialize contact page
 */
function initContactPage() {
    console.log('Initializing Contact Page...');

    initTheme();
    bindEventListeners();
    initNavbarScroll();
}

/**
 * Initialize theme
 */
function initTheme() {
    const isDarkMode = localStorage.getItem('f1_theme') !== 'light';
    if (!isDarkMode) {
        document.body.classList.add('light-mode');
    }

    const modeIcon = document.querySelector('.mode-icon');
    if (modeIcon) {
        modeIcon.textContent = isDarkMode ? '🌙' : '☀️';
    }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('light-mode');

    const isDarkMode = !body.classList.contains('light-mode');
    localStorage.setItem('f1_theme', isDarkMode ? 'dark' : 'light');

    const modeIcon = document.querySelector('.mode-icon');
    if (modeIcon) {
        modeIcon.textContent = isDarkMode ? '🌙' : '☀️';
    }
}

/**
 * Bind event listeners
 */
function bindEventListeners() {
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const elementId = href.substring(1);
                scrollToElement(elementId);
            }
        });
    });
}

/**
 * Initialize navbar scroll
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = document.getElementById('submit-button');
    const formMessage = document.getElementById('form-message');

    // Get form data
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validate form
    if (!name || !email || !subject || !message) {
        showMessage('Please fill out all fields.', 'error');
        return;
    }

    // Validate email
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }

    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    // Simulate sending (in real app, would send to backend)
    setTimeout(() => {
        // Store message in localStorage for demonstration
        const messages = JSON.parse(localStorage.getItem('f1_contact_messages') || '[]');
        messages.push({
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('f1_contact_messages', JSON.stringify(messages));

        // Show success message
        showMessage('✓ Your message has been sent! Thank you for contacting us.', 'success');

        // Reset form
        form.reset();

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';

        // Clear message after 5 seconds
        setTimeout(() => {
            formMessage.classList.remove('success', 'error');
        }, 5000);
    }, 500);
}

/**
 * Show message
 * @param {string} text - Message text
 * @param {string} type - Message type ('success' or 'error')
 */
function showMessage(text, type) {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.textContent = text;
        formMessage.className = `form-message ${type}`;
    }
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Scroll to element
 * @param {string} elementId - Element ID
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactPage);
} else {
    initContactPage();
}
