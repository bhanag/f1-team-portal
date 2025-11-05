/**
 * MotoGP Team Portal - Teams Page JavaScript
 * Handles team listing, filtering, sorting, and navigation
 */

// Teams page state
const TeamsPage = {
    allTeams: [],
    filteredTeams: [],
    currentView: 'grid',
    currentSort: 'name',
    currentFilter: { manufacturer: '', search: '' },
    isLoading: false
};

/**
 * Initialize teams page
 */
async function initTeamsPageModule() {
    console.log('🏁 Initializing teams page module...');

    try {
        // Initialize event listeners
        initializeEventListeners();

        // Load teams data
        await loadTeamsData();

        // Update UI
        updateUI();

        console.log('✅ Teams page module initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize teams page module:', error);
        showError('Failed to load teams data. Please refresh the page.');
    }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Manufacturer filter
    const manufacturerFilter = document.getElementById('manufacturerFilter');
    if (manufacturerFilter) {
        manufacturerFilter.addEventListener('change', (e) => {
            TeamsPage.currentFilter.manufacturer = e.target.value;
            applyFilters();
        });
    }

    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            TeamsPage.currentSort = e.target.value;
            sortTeams();
            renderTeams();
        });
    }

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            TeamsPage.currentFilter.search = e.target.value.trim();
            applyFilters();
        }, 300));
    }

    // Manufacturer quick links in footer
    document.querySelectorAll('.manufacturer-filter').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const manufacturer = e.target.dataset.manufacturer;
            if (manufacturerFilter) {
                manufacturerFilter.value = manufacturer;
                TeamsPage.currentFilter.manufacturer = manufacturer;
                applyFilters();

                // Scroll to teams section
                document.querySelector('.teams-container')?.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Load teams data
 */
async function loadTeamsData() {
    const loadingEl = document.getElementById('teamsLoading');
    const gridEl = document.getElementById('teamsGrid');
    const noResultsEl = document.getElementById('noResults');

    try {
        showLoading(true);

        // Get teams from cache or fetch
        let teams = window.motoGPState.cache.teams;

        if (!teams) {
            const dataFetcher = new DataFetcher();
            teams = await dataFetcher.fetchTeams();
        }

        if (!teams || teams.length === 0) {
            throw new Error('No teams data available');
        }

        TeamsPage.allTeams = teams;
        TeamsPage.filteredTeams = teams;

        hideLoading();
        renderTeams();

    } catch (error) {
        console.error('Failed to load teams:', error);
        showLoadingError(error);
    }
}

/**
 * Apply filters to teams
 */
function applyFilters() {
    const { manufacturer, search } = TeamsPage.currentFilter;

    TeamsPage.filteredTeams = TeamsPage.allTeams.filter(team => {
        const matchesManufacturer = !manufacturer ||
            team.manufacturer.toLowerCase() === manufacturer;

        const matchesSearch = !search ||
            team.name.toLowerCase().includes(search) ||
            team.manufacturer.toLowerCase().includes(search) ||
            team.base.toLowerCase().includes(search);

        return matchesManufacturer && matchesSearch;
    });

    sortTeams();
    renderTeams();
}

/**
 * Sort teams
 */
function sortTeams() {
    const sortField = TeamsPage.currentSort;

    TeamsPage.filteredTeams.sort((a, b) => {
        switch (sortField) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'manufacturer':
                const manA = a.manufacturer;
                const manB = b.manufacturer;
                if (manA !== manB) {
                    return manA.localeCompare(manB);
                }
                return a.name.localeCompare(b.name);
            case 'standing':
                // This would require championship data
                // For now, keep original order
                return 0;
            default:
                return a.name.localeCompare(b.name);
        }
    });
}

/**
 * Switch between grid and list view
 */
function switchView(view) {
    TeamsPage.currentView = view;

    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    // Re-render with new view
    renderTeams();
}

/**
 * Render teams based on current view and filters
 */
function renderTeams() {
    const gridEl = document.getElementById('teamsGrid');
    const noResultsEl = document.getElementById('noResults');

    if (TeamsPage.filteredTeams.length === 0) {
        if (gridEl) gridEl.style.display = 'none';
        if (noResultsEl) noResultsEl.style.display = 'block';
        return;
    }

    if (gridEl) gridEl.style.display = 'grid';
    if (noResultsEl) noResultsEl.style.display = 'none';

    if (TeamsPage.currentView === 'grid') {
        renderGridView();
    } else {
        renderListView();
    }
}

/**
 * Render grid view
 */
function renderGridView() {
    const gridEl = document.getElementById('teamsGrid');
    if (!gridEl) return;

    gridEl.className = 'teams-grid grid grid-cols-2 grid-cols-md-3 grid-cols-lg-4';
    gridEl.innerHTML = TeamsPage.filteredTeams.map((team, index) => `
        <div class="team-card team-card--${getTeamClass(team.id)} fade-on-scroll"
             style="animation-delay: ${index * 0.1}s"
             onclick="TeamsPage.navigateToTeamDetail('${team.id}')">
            <div class="team-logo">
                <img src="${team.logo}" alt="${team.name}"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='🏍️';"
                     loading="lazy">
            </div>
            <h3 class="team-name">${team.name}</h3>
            <p class="team-manufacturer">${team.manufacturer}</p>
            <div class="team-location">
                <span class="location-icon">📍</span>
                <span class="location-text">${team.base}</span>
            </div>
            <button class="btn btn-primary btn-sm">View Team Details</button>
        </div>
    `).join('');
}

/**
 * Render list view
 */
function renderListView() {
    const gridEl = document.getElementById('teamsGrid');
    if (!gridEl) return;

    gridEl.className = 'teams-list';
    gridEl.innerHTML = TeamsPage.filteredTeams.map((team, index) => `
        <div class="team-list-item card fade-on-scroll"
             style="animation-delay: ${index * 0.05}s">
            <div class="card-body">
                <div class="team-list-content">
                    <div class="team-list-logo">
                        <img src="${team.logo}" alt="${team.name}"
                             onerror="this.style.display='none'; this.parentElement.innerHTML='🏍️';"
                             loading="lazy">
                    </div>
                    <div class="team-list-info">
                        <h3 class="team-list-name">${team.name}</h3>
                        <p class="team-list-manufacturer">${team.manufacturer}</p>
                        <p class="team-list-location">
                            <span class="location-icon">📍</span>
                            ${team.base} • ${team.team_principal}
                        </p>
                    </div>
                    <div class="team-list-actions">
                        <button class="btn btn-primary" onclick="TeamsPage.navigateToTeamDetail('${team.id}')">
                            View Details
                        </button>
                        <a href="${team.website}" target="_blank" class="btn btn-outline btn-sm">
                            Official Site
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Navigate to team detail page
 */
function navigateToTeamDetail(teamId) {
    window.location.href = `team-detail.html?id=${teamId}`;
}

/**
 * Get team class for styling
 */
function getTeamClass(teamId) {
    const teamMap = {
        'ducati-lenovo': 'ducati',
        'aprilia-racing': 'aprilia',
        'monster-yamaha': 'yamaha',
        'redbull-ktm': 'ktm',
        'honda-castrol': 'honda',
        'lcr-honda': 'honda',
        'gresini-racing': 'ducati',
        'vr46-racing': 'ducati',
        'prima-pramac': 'yamaha',
        'ktm-tech3': 'ktm',
        'trackhouse': 'aprilia',
        'rnf-racing': 'ducati'
    };
    return teamMap[teamId] || 'default';
}

/**
 * Show loading state
 */
function showLoading(show = true) {
    TeamsPage.isLoading = show;
    const loadingEl = document.getElementById('teamsLoading');
    const gridEl = document.getElementById('teamsGrid');

    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
    if (gridEl) {
        gridEl.style.display = show ? 'none' : 'grid';
    }
}

/**
 * Hide loading state
 */
function hideLoading() {
    showLoading(false);
}

/**
 * Show loading error
 */
function showLoadingError(error) {
    const loadingEl = document.getElementById('teamsLoading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div class="error-message text-center">
                <p>Failed to load teams data. Please try refreshing the page.</p>
                <button class="btn btn-primary mt-4" onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

/**
 * Reset all filters
 */
function resetFilters() {
    const manufacturerFilter = document.getElementById('manufacturerFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');

    if (manufacturerFilter) manufacturerFilter.value = '';
    if (sortFilter) sortFilter.value = 'name';
    if (searchInput) searchInput.value = '';

    TeamsPage.currentFilter = { manufacturer: '', search: '' };
    TeamsPage.currentSort = 'name';

    applyFilters();
}

/**
 * Load team standings preview
 */
async function loadTeamStandingsPreview() {
    const container = document.getElementById('teamsStandingsPreview');
    if (!container) return;

    try {
        let standings = window.motoGPState.cache.standings;

        if (!standings) {
            const dataFetcher = new DataFetcher();
            standings = await dataFetcher.fetchStandings();
        }

        if (standings && standings.team_championship) {
            const topTeams = standings.team_championship.slice(0, 5);

            container.innerHTML = `
                <div class="standings-preview-table">
                    <div class="standings-preview-header">
                        <div class="standings-preview-pos">Pos</div>
                        <div class="standings-preview-team">Team</div>
                        <div class="standings-preview-points">Points</div>
                    </div>
                    ${topTeams.map((team, index) => `
                        <div class="standings-preview-row">
                            <div class="standings-preview-pos">
                                <span class="position-badge ${getPositionClass(index + 1)}">${index + 1}</span>
                            </div>
                            <div class="standings-preview-team">
                                <span class="team-name-preview">${team.team_name}</span>
                            </div>
                            <div class="standings-preview-points">
                                <span class="points-value">${team.points}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="preview-unavailable">
                    <p>Team standings temporarily unavailable</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Failed to load team standings:', error);
        container.innerHTML = `
            <div class="preview-unavailable">
                <p>Unable to load team standings</p>
            </div>
        `;
    }
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

// Export functions for global access
window.TeamsPage = {
    init: initTeamsPageModule,
    loadTeamsData,
    renderTeams,
    switchView,
    navigateToTeamDetail,
    loadTeamStandingsPreview,
    resetFilters,
    getTeamClass
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamsPageModule);
} else {
    initTeamsPageModule();
}