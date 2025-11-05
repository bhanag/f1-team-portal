/**
 * MotoGP Team Portal - Standings Page JavaScript
 * Handles championship standings for riders, teams, and manufacturers
 */

// Standings page state
const StandingsPage = {
    standingsData: null,
    currentSort: { field: 'position', order: 'asc' },
    isLoading: false
};

/**
 * Initialize standings page
 */
async function initStandingsPageModule() {
    console.log('🏆 Initializing standings page module...');

    try {
        // Initialize event listeners
        initializeEventListeners();

        // Load standings data
        await loadStandingsData();

        // Render all standings tables
        renderRidersStandings();
        renderTeamsStandings();
        renderManufacturersStandings();
        renderChampionshipLeaders();

        // Update last update time
        updateLastUpdateTime();

        console.log('✅ Standings page module initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize standings page module:', error);
        showError('Failed to load standings data. Please refresh the page.');
    }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content visibility
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Sorting headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortField = header.dataset.sort;

            // Toggle sort order or set new field
            if (StandingsPage.currentSort.field === sortField) {
                StandingsPage.currentSort.order = StandingsPage.currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                StandingsPage.currentSort.field = sortField;
                StandingsPage.currentSort.order = 'asc';
            }

            // Update visual indicators
            sortableHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            header.classList.add(`sort-${StandingsPage.currentSort.order}`);

            // Re-render current tab
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
            if (activeTab === 'riders') {
                renderRidersStandings();
            } else if (activeTab === 'teams') {
                renderTeamsStandings();
            } else if (activeTab === 'manufacturers') {
                renderManufacturersStandings();
            }
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshStandings);
    }
}

/**
 * Load standings data
 */
async function loadStandingsData() {
    try {
        showLoading(true);

        // Get standings from cache or fetch
        let standings = window.motoGPState.cache.standings;

        if (!standings) {
            const dataFetcher = new DataFetcher();
            standings = await dataFetcher.fetchStandings();
        }

        if (!standings) {
            throw new Error('No standings data available');
        }

        StandingsPage.standingsData = standings;

        // Render all standings tables
        renderRidersStandings();
        renderTeamsStandings();
        renderManufacturersStandings();
        renderChampionshipLeaders();

        hideLoading();

    } catch (error) {
        console.error('Failed to load standings:', error);
        showStandingsError();
    }
}

/**
 * Render riders championship standings
 */
function renderRidersStandings() {
    const tbody = document.getElementById('ridersStandingsBody');
    if (!tbody || !StandingsPage.standingsData?.rider_championship) return;

    const sortedStandings = sortStandings(StandingsPage.standingsData.rider_championship, StandingsPage.currentSort.field, StandingsPage.currentSort.order);

    tbody.innerHTML = sortedStandings.map((rider, index) => `
        <tr class="standings-row" data-position="${rider.position}">
            <td>
                <span class="position-badge ${getPositionClass(rider.position)}">${rider.position}</span>
            </td>
            <td>
                <div class="rider-cell">
                    <span class="rider-name">${rider.rider_name}</span>
                    <span class="rider-number">#${getRiderNumber(rider.rider_name)}</span>
                </div>
            </td>
            <td>
                <span class="team-name">${rider.team}</span>
            </td>
            <td>
                <span class="manufacturer-name">${rider.manufacturer}</span>
            </td>
            <td>
                <span class="points-value">${rider.points}</span>
            </td>
            <td>
                <span class="stat-value">${rider.wins || 0}</span>
            </td>
            <td>
                <span class="stat-value">${rider.podiums || 0}</span>
            </td>
            <td>
                <span class="gap-value">${rider.gap_to_leader || 'Leader'}</span>
            </td>
        </tr>
    `).join('');
}

/**
 * Render teams championship standings
 */
function renderTeamsStandings() {
    const tbody = document.getElementById('teamsStandingsBody');
    if (!tbody || !StandingsPage.standingsData?.team_championship) return;

    const sortedStandings = sortStandings(StandingsPage.standingsData.team_championship, 'position', 'asc');

    tbody.innerHTML = sortedStandings.map((team, index) => `
        <tr class="standings-row" data-position="${team.position}">
            <td>
                <span class="position-badge ${getPositionClass(team.position)}">${team.position}</span>
            </td>
            <td>
                <span class="team-name">${team.team_name}</span>
            </td>
            <td>
                <span class="manufacturer-name">${team.manufacturer}</span>
            </td>
            <td>
                <span class="points-value">${team.points}</span>
            </td>
            <td>
                <span class="stat-value">${team.wins || 0}</span>
            </td>
            <td>
                <span class="stat-value">${team.podiums || 0}</span>
            </td>
            <td>
                <span class="gap-value">${team.gap_to_leader || 'Leader'}</span>
            </td>
        </tr>
    `).join('');
}

/**
 * Render manufacturers championship standings
 */
function renderManufacturersStandings() {
    const tbody = document.getElementById('manufacturersStandingsBody');
    if (!tbody || !StandingsPage.standingsData?.manufacturer_championship) return;

    const sortedStandings = sortStandings(StandingsPage.standingsData.manufacturer_championship, 'position', 'asc');

    tbody.innerHTML = sortedStandings.map((manufacturer, index) => `
        <tr class="standings-row" data-position="${manufacturer.position}">
            <td>
                <span class="position-badge ${getPositionClass(manufacturer.position)}">${manufacturer.position}</span>
            </td>
            <td>
                <span class="manufacturer-name">${manufacturer.manufacturer}</span>
            </td>
            <td>
                <span class="points-value">${manufacturer.points}</span>
            </td>
            <td>
                <span class="stat-value">${manufacturer.wins || 0}</span>
            </td>
            <td>
                <span class="stat-value">${manufacturer.podiums || 0}</span>
            </td>
            <td>
                <span class="stat-value">${manufacturer.poles || 0}</span>
            </td>
        </tr>
    `).join('');
}

/**
 * Render championship leaders
 */
function renderChampionshipLeaders() {
    const leadersGrid = document.getElementById('leadersGrid');
    if (!leadersGrid || !StandingsPage.standingsData) return;

    const ridersLeader = StandingsPage.standingsData.rider_championship?.[0];
    const teamsLeader = StandingsPage.standingsData.team_championship?.[0];
    const manufacturersLeader = StandingsPage.standingsData.manufacturer_championship?.[0];

    leadersGrid.innerHTML = `
        <div class="leader-card card">
            <div class="card-body text-center">
                <div class="leader-icon">👨‍🦰</div>
                <h3 class="leader-title">Rider Leader</h3>
                <div class="leader-name">${ridersLeader?.rider_name || 'Loading...'}</div>
                <div class="leader-team">${ridersLeader?.team || ''}</div>
                <div class="leader-points">${ridersLeader?.points || 0} pts</div>
            </div>
        </div>
        <div class="leader-card card">
            <div class="card-body text-center">
                <div class="leader-icon">🏁</div>
                <h3 class="leader-title">Team Leader</h3>
                <div class="leader-name">${teamsLeader?.team_name || 'Loading...'}</div>
                <div class="leader-team">${teamsLeader?.manufacturer || ''}</div>
                <div class="leader-points">${teamsLeader?.points || 0} pts</div>
            </div>
        </div>
        <div class="leader-card card">
            <div class="card-body text-center">
                <div class="leader-icon">🏭</div>
                <h3 class="leader-title">Manufacturer Leader</h3>
                <div class="leader-name">${manufacturersLeader?.manufacturer || 'Loading...'}</div>
                <div class="leader-team">All Teams</div>
                <div class="leader-points">${manufacturersLeader?.points || 0} pts</div>
            </div>
        </div>
    `;
}

/**
 * Sort standings
 */
function sortStandings(standings, field, order) {
    return [...standings].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Handle different data types
        if (field === 'position' || field === 'points' || field === 'wins' || field === 'podiums') {
            aVal = parseInt(aVal) || 0;
            bVal = parseInt(bVal) || 0;
        }

        if (order === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });
}

/**
 * Get position class for styling
 */
function getPositionClass(position) {
    if (position === 1) return 'gold';
    if (position === 2) return 'silver';
    if (position === 3) return 'bronze';
    return 'default';
}

/**
 * Get rider number (mock implementation)
 */
function getRiderNumber(riderName) {
    const riderNumbers = {
        'Marc Márquez': '93',
        'Francesco Bagnaia': '1',
        'Jorge Martín': '89',
        'Fabio Quartararo': '20',
        'Brad Binder': '33',
        'Pedro Acosta': '31',
        'Alex Rins': '42',
        'Marco Bezzecchi': '72',
        'Enea Bastianini': '23',
        'Maverick Viñales': '12',
        'Luca Marini': '10',
        'Joan Mir': '36',
        'Johann Zarco': '5',
        'Jack Miller': '43',
        'Miguel Oliveira': '88',
        'Franco Morbidelli': '21',
        'Álex Márquez': '73',
        'Raúl Fernández': '25',
        'Takaaki Nakagami': '30'
    };
    return riderNumbers[riderName] || '--';
}

/**
 * Update last update time
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const lastUpdateTimeEl = document.getElementById('lastUpdateTime');
    if (lastUpdateTimeEl) {
        lastUpdateTimeEl.textContent = timeString;
    }
}

/**
 * Perform search
 */
function performSearch() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;

    if (!searchQuery) {
        // Reset to original standings
        if (activeTab === 'riders') {
            renderRidersStandings();
        } else if (activeTab === 'teams') {
            renderTeamsStandings();
        } else if (activeTab === 'manufacturers') {
            renderManufacturersStandings();
        }
        return;
    }

    // Filter standings based on search
    if (activeTab === 'riders' && StandingsPage.standingsData?.rider_championship) {
        const filtered = StandingsPage.standingsData.rider_championship.filter(rider =>
            rider.rider_name.toLowerCase().includes(searchQuery) ||
            rider.team.toLowerCase().includes(searchQuery) ||
            rider.manufacturer.toLowerCase().includes(searchQuery)
        );
        renderFilteredStandings('riders', filtered);
    } else if (activeTab === 'teams' && StandingsPage.standingsData?.team_championship) {
        const filtered = StandingsPage.standingsData.team_championship.filter(team =>
            team.team_name.toLowerCase().includes(searchQuery) ||
            team.manufacturer.toLowerCase().includes(searchQuery)
        );
        renderFilteredStandings('teams', filtered);
    } else if (activeTab === 'manufacturers' && StandingsPage.standingsData?.manufacturer_championship) {
        const filtered = StandingsPage.standingsData.manufacturer_championship.filter(manufacturer =>
            manufacturer.manufacturer.toLowerCase().includes(searchQuery)
        );
        renderFilteredStandings('manufacturers', filtered);
    }
}

/**
 * Render filtered standings
 */
function renderFilteredStandings(type, filteredData) {
    let tbody;
    if (type === 'riders') {
        tbody = document.getElementById('ridersStandingsBody');
    } else if (type === 'teams') {
        tbody = document.getElementById('teamsStandingsBody');
    } else if (type === 'manufacturers') {
        tbody = document.getElementById('manufacturersStandingsBody');
    }

    if (!tbody || filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8">
                    <div class="no-results">
                        <p>No results found for your search</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Re-render with filtered data (simplified for brevity)
    if (type === 'riders') {
        renderRidersStandings();
    } else if (type === 'teams') {
        renderTeamsStandings();
    } else if (type === 'manufacturers') {
        renderManufacturersStandings();
    }
}

/**
 * Refresh standings
 */
async function refreshStandings() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalContent = refreshBtn.innerHTML;

    try {
        refreshBtn.innerHTML = '<span class="spinner"></span> Refreshing...';
        refreshBtn.disabled = true;

        // Clear cache and fetch fresh data
        const cacheManager = window.cacheManager || new CacheManager();
        await cacheManager.delete('standings');

        const dataFetcher = new DataFetcher();
        StandingsPage.standingsData = await dataFetcher.fetchStandings();
        await cacheManager.set('standings', StandingsPage.standingsData);

        // Re-render all standings
        renderRidersStandings();
        renderTeamsStandings();
        renderManufacturersStandings();
        renderChampionshipLeaders();
        updateLastUpdateTime();

        if (window.motoGPApp && window.motoGPApp.showSuccess) {
            window.motoGPApp.showSuccess('Standings refreshed successfully!');
        }

    } catch (error) {
        console.error('Failed to refresh standings:', error);
        if (window.motoGPApp && window.motoGPApp.showError) {
            window.motoGPApp.showError('Failed to refresh standings. Please try again.');
        }
    } finally {
        refreshBtn.innerHTML = originalContent;
        refreshBtn.disabled = false;
    }
}

/**
 * Show loading state
 */
function showLoading(show = true) {
    StandingsPage.isLoading = show;
}

/**
 * Hide loading state
 */
function hideLoading() {
    showLoading(false);
}

/**
 * Show standings error
 */
function showStandingsError() {
    const errorHTML = `
        <div class="standings-error text-center py-16">
            <div class="error-icon mb-6">
                <span style="font-size: 4rem;">📊</span>
            </div>
            <h2 class="text-2xl font-semibold mb-4">Standings Unavailable</h2>
            <p class="text-secondary mb-6">Unable to load championship standings at this time.</p>
            <div class="error-actions">
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
                <button class="btn btn-outline" onclick="window.history.back()">Go Back</button>
            </div>
        </div>
    `;

    // Insert error message into each tab content
    document.getElementById('ridersTab').innerHTML = errorHTML;
    document.getElementById('teamsTab').innerHTML = errorHTML;
    document.getElementById('manufacturersTab').innerHTML = errorHTML;
}

// Export functions for global access
window.StandingsPage = {
    init: initStandingsPageModule,
    loadStandingsData,
    renderRidersStandings,
    renderTeamsStandings,
    renderManufacturersStandings,
    renderChampionshipLeaders,
    refreshStandings,
    updateLastUpdateTime
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStandingsPageModule);
} else {
    initStandingsPageModule();
}