/**
 * UTILS.JS
 * Helper functions for the F1 Team Portal
 */

/**
 * Extract URL query parameter
 * @param {string} paramName - The parameter name to extract
 * @returns {string|null} - The parameter value or null
 */
function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

/**
 * Smooth scroll to an element
 * @param {string} elementId - The ID of the element to scroll to
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Format number with thousand separators
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Debounce function for search input
 * @param {function} func - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} - Debounced function
 */
function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Get team accent color based on team name
 * @param {string} teamName - The team name
 * @returns {string} - The hex color code
 */
function getTeamAccentColor(teamName) {
    const colors = {
        'mercedes': '#00D4BE',
        'red bull': '#0600EF',
        'redbull': '#0600EF',
        'ferrari': '#FF1801',
        'mclaren': '#FF8700',
        'alpine': '#0093D0',
        'aston martin': '#006F62',
        'astonmartin': '#006F62',
        'williams': '#005AFF',
        'alfa romeo': '#900000',
        'alfaromeo': '#900000',
        'haas': '#FFFFFF',
        'alpha tauri': '#2B4562',
        'alphatauri': '#2B4562'
    };

    const normalizedName = teamName.toLowerCase().trim();
    return colors[normalizedName] || '#FF1801';
}

/**
 * Get team ID from team name
 * @param {string} teamName - The team name
 * @returns {string} - The team ID slug
 */
function getTeamId(teamName) {
    return teamName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Check if value is a valid cache timestamp (within 24 hours)
 * @param {number} timestamp - The cache timestamp
 * @returns {boolean} - True if cache is valid (less than 24 hours old)
 */
function isCacheValid(timestamp) {
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
}

/**
 * Parse team data from Ergast API response
 * @param {object} apiResponse - The API response object
 * @returns {array} - Array of transformed team objects
 */
function parseErgastData(apiResponse) {
    if (!apiResponse || !apiResponse.MRData || !apiResponse.MRData.TeamTable || !apiResponse.MRData.TeamTable.Teams) {
        return null;
    }

    return apiResponse.MRData.TeamTable.Teams.map(team => ({
        id: getTeamId(team.name),
        name: team.name,
        country: team.nationality,
        founded: parseInt(team.established) || new Date().getFullYear(),
        principal: 'Team Principal',
        powerUnit: team.constructor || 'Unknown',
        championships: 0,
        wins: 0,
        podiums: 0,
        drivers: [],
        website: team.url || '#',
        accent_color: getTeamAccentColor(team.name)
    }));
}

/**
 * Get CSS custom property value
 * @param {string} propertyName - The CSS variable name (without --)
 * @returns {string} - The CSS variable value
 */
function getCSSVariable(propertyName) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${propertyName}`).trim();
}

/**
 * Set CSS custom property value
 * @param {string} propertyName - The CSS variable name (without --)
 * @param {string} value - The value to set
 */
function setCSSVariable(propertyName, value) {
    document.documentElement.style.setProperty(`--${propertyName}`, value);
}

/**
 * Convert emoji to HTML entity
 * @param {string} emoji - The emoji character
 * @returns {string} - The HTML entity
 */
function emojiToHTML(emoji) {
    return emoji;
}

/**
 * Get day name from date
 * @param {Date} date - The date object
 * @returns {string} - The day name
 */
function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

/**
 * Format date to readable string
 * @param {Date} date - The date object
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

export {
    getQueryParam,
    scrollToElement,
    formatNumber,
    debounce,
    getTeamAccentColor,
    getTeamId,
    isCacheValid,
    parseErgastData,
    getCSSVariable,
    setCSSVariable,
    emojiToHTML,
    getDayName,
    formatDate
};
