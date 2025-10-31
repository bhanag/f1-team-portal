/**
 * DRIVERS.JS
 * Drivers page initialization and event handling
 */

// Global state
let allDriversData = [];
let allTeamsData = [];
let currentModalDriver = null;

/**
 * Initialize the drivers page on page load
 */
function initDriversPage() {
    console.log('Initializing F1 Drivers Page...');

    // Initialize theme (check for saved preference)
    initTheme();

    // Bind event listeners
    bindEventListeners();

    // Load teams and drivers data
    loadAndRenderDrivers();

    // Initialize navbar scroll effect
    initNavbarScroll();
}

/**
 * Initialize theme based on localStorage preference
 */
function initTheme() {
    const isDarkMode = localStorage.getItem('f1_theme') !== 'light';
    if (!isDarkMode) {
        document.body.classList.add('light-mode');
    }

    // Update mode icon
    const modeIcon = document.querySelector('.mode-icon');
    if (modeIcon) {
        modeIcon.textContent = isDarkMode ? '🌙' : '☀️';
    }
}

/**
 * Toggle dark mode and save preference
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

    // Modal controls
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');

    if (modalClose) {
        modalClose.addEventListener('click', closeDriverModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeDriverModal();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDriverModal();
        }
    });

    // Navigation links
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
 * Load teams data and extract drivers
 */
async function loadAndRenderDrivers() {
    try {
        console.log('Loading teams and drivers data...');
        allTeamsData = await fetchTeamsData();

        if (allTeamsData && allTeamsData.length > 0) {
            // Extract all drivers from all teams
            allDriversData = extractAllDrivers(allTeamsData);
            console.log(`Loaded ${allDriversData.length} drivers from ${allTeamsData.length} teams`);
            renderDriversToDOM(allDriversData);
        } else {
            console.warn('No teams data available');
            renderErrorMessage('Failed to load drivers. Please refresh the page.');
        }
    } catch (error) {
        console.error('Error loading drivers:', error);
        renderErrorMessage('Error loading drivers data. Please try again later.');
    }
}

/**
 * Extract all drivers from all teams
 * @param {array} teams - Array of team objects
 * @returns {array} - Array of driver objects with team info
 */
function extractAllDrivers(teams) {
    const drivers = [];

    teams.forEach(team => {
        if (team.drivers && Array.isArray(team.drivers)) {
            team.drivers.forEach(driver => {
                drivers.push({
                    ...driver,
                    teamId: team.id,
                    teamName: team.name,
                    teamColor: team.accent_color,
                    teamLogo: team.logo
                });
            });
        }
    });

    return drivers;
}

/**
 * Render drivers to DOM
 * @param {array} drivers - Array of driver objects
 */
function renderDriversToDOM(drivers) {
    const driversGrid = document.getElementById('drivers-grid');
    if (!driversGrid) return;

    const html = renderDriversGrid(drivers);
    driversGrid.innerHTML = html;

    // Add event listeners to driver cards
    document.querySelectorAll('.team-card').forEach(card => {
        const driverId = card.getAttribute('data-driver-id');
        const viewDetailsBtn = card.querySelector('.view-details-button');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDriverModal(driverId);
            });
        }
    });
}

/**
 * Render drivers grid
 * @param {array} drivers - Array of driver objects
 * @returns {string} - HTML string for drivers grid
 */
function renderDriversGrid(drivers) {
    if (!drivers || drivers.length === 0) {
        return '<div class="teams-loading">No drivers found.</div>';
    }

    return drivers.map(driver => `
        <div class="team-card" data-driver-id="${driver.id}" style="--team-color: ${driver.teamColor}">
            <img src="${driver.image}" alt="${driver.name}" class="team-logo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2230%22 fill=%22%23CCC%22/><text x=%2250%25%22 y=%2255%25%22 font-size=%2220%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>#${driver.number}</text></svg>'">
            <h3 class="team-name">${driver.name}</h3>
            <p class="team-country">${driver.teamName}</p>
            <button class="view-details-button">View Details</button>
        </div>
    `).join('');
}

/**
 * Handle search/filter
 * @param {Event} event - Input event from search box
 */
function handleSearch(event) {
    const query = event.target.value.trim();
    console.log('Searching drivers:', query);

    if (query === '') {
        renderDriversToDOM(allDriversData);
    } else {
        const filtered = filterDrivers(query, allDriversData);
        renderDriversToDOM(filtered);
    }
}

/**
 * Filter drivers by search query
 * @param {string} query - Search query
 * @param {array} drivers - Array of driver objects
 * @returns {array} - Filtered drivers
 */
function filterDrivers(query, drivers) {
    if (!query || !drivers || !Array.isArray(drivers)) {
        return drivers || [];
    }

    const lowerQuery = query.toLowerCase();
    return drivers.filter(driver =>
        driver.name.toLowerCase().includes(lowerQuery) ||
        driver.teamName.toLowerCase().includes(lowerQuery) ||
        driver.nationality.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Debounce function
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
 * Open driver details modal
 * @param {string} driverId - The driver ID to display
 */
function openDriverModal(driverId) {
    if (!driverId || !allDriversData) return;

    const driver = allDriversData.find(d => d.id === driverId);
    if (!driver) {
        console.warn(`Driver not found: ${driverId}`);
        return;
    }

    currentModalDriver = driver;
    const modalContent = document.getElementById('modal-content');
    const modalOverlay = document.getElementById('modal-overlay');

    if (modalContent && modalOverlay) {
        const html = renderDriverDetailsModal(driver);
        modalContent.innerHTML = html;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        console.log('Opened modal for driver:', driver.name);
    }
}

/**
 * Close driver details modal
 */
function closeDriverModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Closed driver modal');
    }
}

/**
 * Render driver details modal content
 * @param {object} driver - Driver object
 * @returns {string} - HTML string for driver details
 */
function renderDriverDetailsModal(driver) {
    if (!driver) {
        return '<div>Driver not found.</div>';
    }

    return `
        <div style="--team-color: ${driver.teamColor}">
        <div class="modal-banner" style="background: linear-gradient(135deg, ${driver.teamColor}, rgba(255, 24, 1, 0.3));">
            <img src="${driver.image}" alt="${driver.name}" class="modal-banner-logo" style="width: 120px; height: 150px; object-fit: cover;">
            <h2 class="modal-banner-title">#${driver.number} ${driver.name}</h2>
        </div>

        <div class="modal-grid">
            <!-- Left Column: Driver Info -->
            <div class="modal-info-section">
                <div class="modal-info-item">
                    <span class="modal-info-label">Team</span>
                    <span class="modal-info-value">${driver.teamName}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Driver Number</span>
                    <span class="modal-info-value">#${driver.number}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Nationality</span>
                    <span class="modal-info-value">${driver.nationality}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Points</span>
                    <span class="modal-info-value">${driver.points || 0}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Races</span>
                    <span class="modal-info-value">${driver.races || 0}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Career Wins</span>
                    <span class="modal-info-value">${driver.wins || 0}</span>
                </div>
            </div>

            <!-- Right Column: Stats Display -->
            <div class="modal-info-section">
                <div class="modal-info-item" style="flex-direction: column; align-items: flex-start;">
                    <span class="modal-info-label">Career Statistics</span>
                    <div style="margin-top: 12px; width: 100%;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                            <span>Points Average:</span>
                            <strong>${driver.races ? (driver.points / driver.races).toFixed(1) : '0'} pts/race</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                            <span>Win Ratio:</span>
                            <strong>${driver.races ? ((driver.wins / driver.races) * 100).toFixed(1) : '0'}%</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span>Status:</span>
                            <strong style="color: ${driver.teamColor}">Active</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
            <button class="modal-link-button" style="background-color: ${driver.teamColor}" onclick="window.location.href='index.html#teams-section'">
                View Team
            </button>
        </div>
        </div>
    `;
}

/**
 * Render error message
 * @param {string} message - Error message to display
 */
function renderErrorMessage(message) {
    const driversGrid = document.getElementById('drivers-grid');
    if (driversGrid) {
        driversGrid.innerHTML = `<div class="teams-loading" style="color: #FF1801; grid-column: 1 / -1;">${message}</div>`;
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
 * Make openDriverModal globally accessible
 */
window.openDriverModal = openDriverModal;

// Initialize drivers page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDriversPage);
} else {
    initDriversPage();
}
