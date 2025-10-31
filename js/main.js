/**
 * MAIN.JS
 * App initialization, routing, and event handling
 */

// Global state
let allTeamsData = [];
let currentModalTeam = null;

/**
 * Initialize the app on page load
 */
function initApp() {
    console.log('Initializing F1 Team Portal...');

    // Initialize theme (check for saved preference)
    initTheme();

    // Bind event listeners
    bindEventListeners();

    // Load teams data and render
    loadAndRenderTeams();

    // Initialize navbar scroll effect
    initNavbarScroll();
}

/**
 * Initialize theme based on localStorage preference
 */
function initTheme() {
    const isDarkMode = localStorage.getItem('f1_theme') !== 'light';
    const htmlElement = document.documentElement;

    if (isDarkMode) {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
}

/**
 * Toggle dark mode and save preference
 */
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('light-mode');

    // Save preference
    const isDarkMode = !body.classList.contains('light-mode');
    localStorage.setItem('f1_theme', isDarkMode ? 'dark' : 'light');

    // Update button icon
    const modeIcon = document.querySelector('.mode-icon');
    if (modeIcon) {
        modeIcon.textContent = isDarkMode ? '🌙' : '☀️';
    }

    console.log('Theme toggled to:', isDarkMode ? 'dark' : 'light');
}

/**
 * Bind all event listeners
 */
function bindEventListeners() {
    // Dark mode toggle
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }

    // Search box
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('input', debounce(handleSearch, 300));
    }

    // Explore button in hero
    const exploreBtn = document.getElementById('explore-button');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            scrollToElement('teams-section');
        });
    }

    // Modal controls
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');

    if (modalClose) {
        modalClose.addEventListener('click', closeTeamModal);
    }

    if (modalOverlay) {
        // Close modal when clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeTeamModal();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTeamModal();
        }
    });

    // Navigation links smooth scroll
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
 * Handle navbar scroll effect
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
 * Load teams data and render
 */
async function loadAndRenderTeams() {
    try {
        console.log('Loading teams data...');
        allTeamsData = await fetchTeamsData();

        if (allTeamsData && allTeamsData.length > 0) {
            console.log(`Loaded ${allTeamsData.length} teams`);
            renderTeamsToDOM(allTeamsData);
        } else {
            console.warn('No teams data available');
            renderErrorMessage('Failed to load teams. Please refresh the page.');
        }
    } catch (error) {
        console.error('Error loading teams:', error);
        renderErrorMessage('Error loading teams data. Please try again later.');
    }
}

/**
 * Render teams to DOM
 * @param {array} teams - Array of team objects to render
 */
function renderTeamsToDOM(teams) {
    const teamsGrid = document.getElementById('teams-grid');
    if (!teamsGrid) return;

    const html = renderTeamsGrid(teams);
    teamsGrid.innerHTML = html;

    // Add event listeners to newly created team cards
    document.querySelectorAll('.team-card').forEach(card => {
        const teamId = card.getAttribute('data-team-id');
        const viewDetailsBtn = card.querySelector('.view-details-button');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openTeamModal(teamId);
            });
        }
    });
}

/**
 * Handle search/filter
 * @param {Event} event - Input event from search box
 */
function handleSearch(event) {
    const query = event.target.value.trim();
    console.log('Searching for:', query);

    if (query === '') {
        // Show all teams
        renderTeamsToDOM(allTeamsData);
    } else {
        // Filter teams
        const filtered = filterTeams(query, allTeamsData);
        renderTeamsToDOM(filtered);
    }
}

/**
 * Debounce function for search input
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} - Debounced function
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Open team details modal
 * @param {string} teamId - The team ID to display
 */
function openTeamModal(teamId) {
    if (!teamId || !allTeamsData) return;

    const team = getTeamById(teamId, allTeamsData);
    if (!team) {
        console.warn(`Team not found: ${teamId}`);
        return;
    }

    currentModalTeam = team;
    const modalContent = document.getElementById('modal-content');
    const modalOverlay = document.getElementById('modal-overlay');

    if (modalContent && modalOverlay) {
        // Update modal content with team details
        const html = renderTeamDetails(team);
        modalContent.innerHTML = html;

        // Show modal with animation
        modalOverlay.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        console.log('Opened modal for team:', team.name);
    }
}

/**
 * Close team details modal
 */
function closeTeamModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Closed team modal');
    }
}

/**
 * Render error message
 * @param {string} message - Error message to display
 */
function renderErrorMessage(message) {
    const teamsGrid = document.getElementById('teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = `<div class="teams-loading" style="color: #FF1801; grid-column: 1 / -1;">${message}</div>`;
    }
}

/**
 * Scroll to element smoothly
 * @param {string} elementId - Element ID to scroll to
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Get team by ID from teams array
 * @param {string} teamId - Team ID
 * @param {array} teamsArray - Array of teams
 * @returns {object|null} - Team object or null
 */
function getTeamById(teamId, teamsArray) {
    if (!teamsArray || !Array.isArray(teamsArray)) return null;
    return teamsArray.find(team => team.id === teamId.toLowerCase()) || null;
}

/**
 * Filter teams by search query
 * @param {string} query - Search query
 * @param {array} teamsArray - Array of teams
 * @returns {array} - Filtered teams
 */
function filterTeams(query, teamsArray) {
    if (!query || !teamsArray || !Array.isArray(teamsArray)) {
        return teamsArray || [];
    }

    const lowerQuery = query.toLowerCase();
    return teamsArray.filter(team =>
        team.name.toLowerCase().includes(lowerQuery) ||
        team.country.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Make openTeamModal globally accessible
 */
window.openTeamModal = openTeamModal;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
