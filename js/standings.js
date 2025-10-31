/**
 * STANDINGS.JS
 * Driver standings page initialization and event handling
 */

// Global state
let allDriversData = [];
let allTeamsData = [];
let currentFilter = '';

/**
 * Initialize the standings page
 */
function initStandingsPage() {
    console.log('Initializing F1 Standings Page...');

    initTheme();
    bindEventListeners();
    loadAndRenderStandings();
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

    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('input', debounce(handleSearch, 300));
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
 * Load teams and render standings
 */
async function loadAndRenderStandings() {
    try {
        console.log('Loading standings data...');
        allTeamsData = await fetchTeamsData();

        if (allTeamsData && allTeamsData.length > 0) {
            allDriversData = extractAndSortDrivers(allTeamsData);
            console.log(`Loaded ${allDriversData.length} drivers`);
            renderStandingsTable(allDriversData);
        } else {
            renderErrorMessage('Failed to load standings data.');
        }
    } catch (error) {
        console.error('Error loading standings:', error);
        renderErrorMessage('Error loading standings. Please try again.');
    }
}

/**
 * Extract drivers from teams and sort by points
 * @param {array} teams - Array of team objects
 * @returns {array} - Sorted array of driver objects
 */
function extractAndSortDrivers(teams) {
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

    // Sort by points (descending), then by wins
    drivers.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.wins - a.wins;
    });

    return drivers;
}

/**
 * Render standings table
 * @param {array} drivers - Array of sorted driver objects
 */
function renderStandingsTable(drivers) {
    const standingsBody = document.getElementById('standings-body');
    if (!standingsBody) return;

    if (!drivers || drivers.length === 0) {
        standingsBody.innerHTML = '<tr><td colspan="6" class="teams-loading">No drivers found.</td></tr>';
        return;
    }

    const rows = drivers.map((driver, index) => {
        const position = index + 1;
        let rankClass = '';
        if (position === 1) rankClass = 'podium-1';
        else if (position === 2) rankClass = 'podium-2';
        else if (position === 3) rankClass = 'podium-3';

        return `
            <tr>
                <td><span class="standings-rank ${rankClass}">${position}</span></td>
                <td>
                    <div class="driver-cell">
                        <img src="${driver.image}" alt="${driver.name}" class="driver-photo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 50 60%22><rect fill=%22%23666%22 width=%2250%22 height=%2260%22/></svg>'">
                        <div class="driver-info">
                            <h4>#${driver.number} ${driver.name}</h4>
                            <p>${driver.nationality}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="team-name">${driver.teamName}</span>
                </td>
                <td>
                    <span class="points-cell">${driver.points || 0}</span>
                </td>
                <td>
                    <span class="stats-cell">${driver.races || 0}</span>
                </td>
                <td>
                    <span class="stats-cell">${driver.wins || 0}</span>
                </td>
            </tr>
        `;
    }).join('');

    standingsBody.innerHTML = rows;
}

/**
 * Handle search filter
 * @param {Event} event - Input event
 */
function handleSearch(event) {
    const query = event.target.value.trim();
    console.log('Filtering standings:', query);

    if (query === '') {
        renderStandingsTable(allDriversData);
    } else {
        const filtered = filterStandings(query, allDriversData);
        renderStandingsTable(filtered);
    }
}

/**
 * Filter standings by search query
 * @param {string} query - Search query
 * @param {array} drivers - Array of drivers
 * @returns {array} - Filtered drivers
 */
function filterStandings(query, drivers) {
    if (!query || !drivers || !Array.isArray(drivers)) {
        return drivers || [];
    }

    const lowerQuery = query.toLowerCase();
    return drivers.filter(driver =>
        driver.name.toLowerCase().includes(lowerQuery) ||
        driver.teamName.toLowerCase().includes(lowerQuery) ||
        driver.number.toString().includes(query)
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
 * Render error message
 * @param {string} message - Error message
 */
function renderErrorMessage(message) {
    const standingsBody = document.getElementById('standings-body');
    if (standingsBody) {
        standingsBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #FF1801; padding: 40px;">${message}</td></tr>`;
    }
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
    document.addEventListener('DOMContentLoaded', initStandingsPage);
} else {
    initStandingsPage();
}
