/**
 * UI-RENDERER.JS
 * DOM rendering functions for the F1 Team Portal
 */

/**
 * Render the teams grid
 * @param {array} teamsArray - Array of team objects
 * @returns {string} - HTML string for teams grid
 */
function renderTeamsGrid(teamsArray) {
    if (!teamsArray || teamsArray.length === 0) {
        return '<div class="teams-loading">No teams found.</div>';
    }

    return teamsArray.map(team => `
        <div class="team-card" data-team-id="${team.id}" style="--team-color: ${team.accent_color}">
            <img src="${team.logo}" alt="${team.name} logo" class="team-logo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23CCC%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>${team.name.charAt(0)}</text></svg>'">
            <h3 class="team-name">${team.name}</h3>
            <p class="team-country">${team.country}</p>
            <button class="view-details-button" onclick="openTeamModal('${team.id}')">View Details</button>
        </div>
    `).join('');
}

/**
 * Render team details modal
 * @param {object} team - Team object
 * @returns {string} - HTML string for team details
 */
function renderTeamDetails(team) {
    if (!team) {
        return '<div>Team not found.</div>';
    }

    const bannerId = team.id || 'team';
    const driversHTML = renderDriverCards(team.drivers || []);

    return `
        <div style="--team-color: ${team.accent_color}">
        <div class="modal-banner" style="background: linear-gradient(135deg, ${team.accent_color}, rgba(255, 24, 1, 0.3));">
            <img src="${team.logo}" alt="${team.name} logo" class="modal-banner-logo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%25%22 y=%2250%25%22 font-size=%2240%22 fill=%22%23CCC%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>${team.name.charAt(0)}</text></svg>'">
            <h2 class="modal-banner-title">${team.name}</h2>
        </div>

        <div class="modal-grid">
            <!-- Left Column: Team Info -->
            <div class="modal-info-section">
                <div class="modal-info-item">
                    <span class="modal-info-label">Team Principal</span>
                    <span class="modal-info-value">${team.principal || 'N/A'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Power Unit</span>
                    <span class="modal-info-value">${team.powerUnit || 'N/A'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Championships</span>
                    <span class="modal-info-value">${formatNumber(team.championships || 0)}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Total Wins</span>
                    <span class="modal-info-value">${formatNumber(team.wins || 0)}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Total Podiums</span>
                    <span class="modal-info-value">${formatNumber(team.podiums || 0)}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Founded</span>
                    <span class="modal-info-value">${team.founded || 'N/A'}</span>
                </div>
            </div>

            <!-- Right Column: Drivers -->
            <div class="modal-info-section">
                <div class="drivers-container">
                    ${driversHTML || '<p class="modal-info-label">Driver information coming soon</p>'}
                </div>
            </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
            ${team.website && team.website !== '#' ? `
                <a href="${team.website}" target="_blank" rel="noopener noreferrer" class="modal-link-button" style="background-color: ${team.accent_color}">
                    Official Website
                </a>
            ` : ''}
            ${team.social?.twitter && team.social.twitter !== '#' ? `
                <a href="${team.social.twitter}" target="_blank" rel="noopener noreferrer" class="modal-link-button" style="background-color: ${team.accent_color}">
                    Follow on Twitter
                </a>
            ` : ''}
            ${team.social?.instagram && team.social.instagram !== '#' ? `
                <a href="${team.social.instagram}" target="_blank" rel="noopener noreferrer" class="modal-link-button" style="background-color: ${team.accent_color}">
                    Follow on Instagram
                </a>
            ` : ''}
        </div>
        </div>
    `;
}

/**
 * Render driver cards
 * @param {array} drivers - Array of driver objects
 * @returns {string} - HTML string for driver cards
 */
function renderDriverCards(drivers) {
    if (!drivers || drivers.length === 0) {
        return '';
    }

    return drivers.map(driver => renderDriverCard(driver)).join('');
}

/**
 * Render a single driver card
 * @param {object} driver - Driver object
 * @returns {string} - HTML string for driver card
 */
function renderDriverCard(driver) {
    if (!driver) return '';

    return `
        <div class="driver-card">
            <img src="${driver.image}" alt="${driver.name}" class="driver-image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 150%22><rect fill=%22%23333%22 width=%22100%22 height=%22150%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>Driver</text></svg>'">
            <div class="driver-details">
                <div class="driver-number">#${driver.number}</div>
                <div class="driver-name">${driver.name}</div>
                <div class="driver-nationality">${driver.nationality}</div>
                <div class="driver-stats">
                    <div class="driver-stat">
                        <span class="driver-stat-label">Points</span>
                        <span class="driver-stat-value">${driver.points || 0}</span>
                    </div>
                    <div class="driver-stat">
                        <span class="driver-stat-label">Races</span>
                        <span class="driver-stat-value">${driver.races || 0}</span>
                    </div>
                    <div class="driver-stat">
                        <span class="driver-stat-label">Wins</span>
                        <span class="driver-stat-value">${driver.wins || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Inject HTML into element
 * @param {string} elementId - Element ID
 * @param {string} html - HTML string to inject
 */
function injectHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Add CSS class to element
 * @param {string} elementId - Element ID
 * @param {string} className - CSS class name
 */
function addClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Remove CSS class from element
 * @param {string} elementId - Element ID
 * @param {string} className - CSS class name
 */
function removeClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * Show element
 * @param {string} elementId - Element ID
 */
function showElement(elementId) {
    addClass(elementId, 'active');
}

/**
 * Hide element
 * @param {string} elementId - Element ID
 */
function hideElement(elementId) {
    removeClass(elementId, 'active');
}

/**
 * Toggle element visibility
 * @param {string} elementId - Element ID
 */
function toggleElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('active');
    }
}

/**
 * Set data attribute on element
 * @param {string} elementId - Element ID
 * @param {string} attrName - Attribute name
 * @param {string} value - Attribute value
 */
function setDataAttribute(elementId, attrName, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.dataset[attrName] = value;
    }
}

/**
 * Get data attribute from element
 * @param {string} elementId - Element ID
 * @param {string} attrName - Attribute name
 * @returns {string} - Attribute value
 */
function getDataAttribute(elementId, attrName) {
    const element = document.getElementById(elementId);
    if (element) {
        return element.dataset[attrName];
    }
    return null;
}

/**
 * Set inline style on element
 * @param {string} elementId - Element ID
 * @param {string} property - CSS property
 * @param {string} value - CSS value
 */
function setStyle(elementId, property, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style[property] = value;
    }
}

/**
 * Add event listener to element
 * @param {string} elementId - Element ID
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {function} handler - Event handler function
 */
function addEventListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
    }
}

/**
 * Remove event listener from element
 * @param {string} elementId - Element ID
 * @param {string} eventType - Event type
 * @param {function} handler - Event handler function
 */
function removeEventListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.removeEventListener(eventType, handler);
    }
}

/**
 * Get all elements by class name
 * @param {string} className - CSS class name
 * @returns {NodeList} - NodeList of matching elements
 */
function getElementsByClass(className) {
    return document.querySelectorAll(`.${className}`);
}

/**
 * Add event listener to all elements with class
 * @param {string} className - CSS class name
 * @param {string} eventType - Event type
 * @param {function} handler - Event handler function
 */
function addEventListenerToClass(className, eventType, handler) {
    const elements = getElementsByClass(className);
    elements.forEach(element => {
        element.addEventListener(eventType, handler);
    });
}
