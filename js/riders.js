/**
 * MotoGP Team Portal - Riders Page JavaScript
 * Handles rider listing, filtering, sorting, and rider details
 */

// Riders page state
const RidersPage = {
    allRiders: [],
    allTeams: [],
    filteredRiders: [],
    currentView: 'grid',
    currentSort: 'number',
    currentFilter: { team: '', nationality: '', search: '' },
    isLoading: false
};

/**
 * Initialize riders page
 */
async function initRidersPageModule() {
    console.log('👨‍🦰 Initializing riders page module...');

    try {
        // Initialize event listeners
        initializeEventListeners();

        // Load data
        await loadRidersData();
        await loadTeamsData();

        // Render riders
        renderRiders();

        // Load top riders preview
        await loadTopRidersPreview();

        console.log('✅ Riders page module initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize riders page module:', error);
        showError('Failed to load riders data. Please refresh the page.');
    }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Team filter
    const teamFilter = document.getElementById('teamFilter');
    if (teamFilter) {
        teamFilter.addEventListener('change', (e) => {
            RidersPage.currentFilter.team = e.target.value;
            applyFilters();
        });
    }

    // Nationality filter
    const nationalityFilter = document.getElementById('nationalityFilter');
    if (nationalityFilter) {
        nationalityFilter.addEventListener('change', (e) => {
            RidersPage.currentFilter.nationality = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            RidersPage.currentSort = e.target.value;
            sortRiders();
            renderRiders();
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
            RidersPage.currentFilter.search = e.target.value.trim().toLowerCase();
            applyFilters();
        }, 300));
    }
}

/**
 * Load riders data
 */
async function loadRidersData() {
    const loadingEl = document.getElementById('ridersLoading');
    const gridEl = document.getElementById('ridersGrid');
    const noResultsEl = document.getElementById('noResults');

    try {
        showLoading(true);

        // Get riders from cache or fetch
        let riders = window.motoGPState.cache.riders;

        if (!riders) {
            const dataFetcher = new DataFetcher();
            riders = await dataFetcher.fetchRiders();
        }

        if (!riders || riders.length === 0) {
            throw new Error('No riders data available');
        }

        RidersPage.allRiders = riders;
        RidersPage.filteredRiders = riders;

        hideLoading();
        renderRiders();

    } catch (error) {
        console.error('Failed to load riders:', error);
        showLoadingError(error);
    }
}

/**
 * Load teams data
 */
async function loadTeamsData() {
    try {
        let teams = window.motoGPState.cache.teams;

        if (!teams) {
            const dataFetcher = new DataFetcher();
            teams = await dataFetcher.fetchTeams();
        }

        RidersPage.allTeams = teams || [];

    } catch (error) {
        console.error('Failed to load teams data:', error);
    }
}

/**
 * Apply filters to riders
 */
function applyFilters() {
    const { team, nationality, search } = RidersPage.currentFilter;

    RidersPage.filteredRiders = RidersPage.allRiders.filter(rider => {
        const matchesTeam = !team || rider.team === team;
        const matchesNationality = !nationality ||
            rider.nationality.toLowerCase() === nationality;

        const matchesSearch = !search ||
            rider.name.toLowerCase().includes(search) ||
            rider.nationality.toLowerCase().includes(search) ||
            getTeamName(rider.team).toLowerCase().includes(search);

        return matchesTeam && matchesNationality && matchesSearch;
    });

    sortRiders();
    renderRiders();
}

/**
 * Sort riders
 */
function sortRiders() {
    const sortField = RidersPage.currentSort;

    RidersPage.filteredRiders.sort((a, b) => {
        let aVal, bVal;

        switch (sortField) {
            case 'number':
                aVal = a.number;
                bVal = b.number;
                break;
            case 'name':
                aVal = a.name;
                bVal = b.name;
                break;
            case 'team':
                aVal = getTeamName(a.team);
                bVal = getTeamName(b.team);
                break;
            case 'points':
                aVal = a.points_2025 || 0;
                bVal = b.points_2025 || 0;
                break;
            case 'wins':
                aVal = a.career_wins;
                bVal = b.career_wins;
                break;
            default:
                aVal = a.number;
                bVal = b.number;
        }

        if (typeof aVal === 'string') {
            return aVal.localeCompare(bVal);
        } else {
            return aVal - bVal;
        }
    });
}

/**
 * Switch between grid and list view
 */
function switchView(view) {
    RidersPage.currentView = view;

    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    // Re-render with new view
    renderRiders();
}

/**
 * Render riders based on current view and filters
 */
function renderRiders() {
    const gridEl = document.getElementById('ridersGrid');
    const noResultsEl = document.getElementById('noResults');

    if (RidersPage.filteredRiders.length === 0) {
        if (gridEl) gridEl.style.display = 'none';
        if (noResultsEl) noResultsEl.style.display = 'block';
        return;
    }

    if (gridEl) gridEl.style.display = 'grid';
    if (noResultsEl) noResultsEl.style.display = 'none';

    if (RidersPage.currentView === 'grid') {
        renderGridView();
    } else {
        renderListView();
    }
}

/**
 * Render grid view
 */
function renderGridView() {
    const gridEl = document.getElementById('ridersGrid');
    if (!gridEl) return;

    gridEl.className = 'riders-grid grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3';
    gridEl.innerHTML = RidersPage.filteredRiders.map((rider, index) => `
        <div class="rider-card fade-on-scroll"
             style="animation-delay: ${index * 0.05}s"
             onclick="RidersPage.showRiderDetails('${rider.id}')">
            <div class="rider-header">
                <div class="rider-photo">
                    <img src="${rider.photo}" alt="${rider.name}"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='👨‍🦰';"
                         loading="lazy">
                </div>
                <div class="rider-basic-info">
                    <div class="rider-number">${rider.number}</div>
                    <h3 class="rider-name">${rider.name}</h3>
                    <p class="rider-nationality">${rider.flag} ${rider.nationality}</p>
                </div>
            </div>
            <div class="rider-body">
                <div class="rider-team">
                    <span class="team-label">Team:</span>
                    <span class="team-name">${getTeamName(rider.team)}</span>
                </div>
            <div class="rider-stats">
                    <div class="rider-stat-grid grid grid-cols-3">
                        <div class="rider-stat-item text-center">
                            <div class="rider-stat-value">${rider.career_wins}</div>
                            <div class="rider-stat-label">Wins</div>
                        </div>
                        <div class="rider-stat-item text-center">
                            <div class="rider-stat-value">${rider.career_podiums}</div>
                            <div class="rider-stat-label">Podiums</div>
                        </div>
                        <div class="rider-stat-item text-center">
                            <div class="rider-stat-value">${rider.world_championships}</div>
                            <div class="rider-stat-label">Titles</div>
                        </div>
                    </div>
                </div>
                <div class="rider-footer">
                    <div class="rider-age">${rider.age} years old</div>
                    <button class="btn btn-primary btn-sm">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Render list view
 */
function renderListView() {
    const gridEl = document.getElementById('ridersGrid');
    if (!gridEl) return;

    gridEl.className = 'riders-list';
    gridEl.innerHTML = RidersPage.filteredRiders.map((rider, index) => `
        <div class="rider-list-item card fade-on-scroll"
             style="animation-delay: ${index * 0.02}s">
            <div class="card-body">
                <div class="rider-list-content">
                    <div class="rider-list-photo">
                        <img src="${rider.photo}" alt="${rider.name}"
                             onerror="this.style.display='none'; this.parentElement.innerHTML='👨‍🦰';"
                             loading="lazy">
                    </div>
                    <div class="rider-list-info">
                        <div class="rider-list-header">
                            <span class="rider-list-number">${rider.number}</span>
                            <h3 class="rider-list-name">${rider.name}</h3>
                            <span class="rider-list-nationality">${rider.flag} ${rider.nationality}</span>
                        </div>
                        <div class="rider-list-details">
                            <p class="rider-list-team">${getTeamName(rider.team)}</p>
                            <div class="rider-list-stats">
                                <span class="stat-badge">Wins: ${rider.career_wins}</span>
                                <span class="stat-badge">Podiums: ${rider.career_podiums}</span>
                                <span class="stat-badge">Titles: ${rider.world_championships}</span>
                            </div>
                        </div>
                    </div>
                    <div class="rider-list-actions">
                        <button class="btn btn-primary" onclick="RidersPage.showRiderDetails('${rider.id}')">
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Load top riders preview
 */
async function loadTopRidersPreview() {
    const container = document.getElementById('topRidersPreview');
    if (!container) return;

    try {
        let standings = window.motoGPState.cache.standings;

        if (!standings) {
            const dataFetcher = new DataFetcher();
            standings = await dataFetcher.fetchStandings();
        }

        if (standings && standings.rider_championship) {
            const topRiders = standings.rider_championship.slice(0, 5);

            // Get rider details for top riders
            const topRiderDetails = topRiders.map(standing => {
                const rider = RidersPage.allRiders.find(r => r.id === standing.rider_id);
                return {
                    ...standing,
                    photo: rider?.photo || '',
                    nationality: rider?.nationality || '',
                    flag: rider?.flag || '',
                    team: rider?.team || ''
                };
            });

            container.innerHTML = `
                <div class="top-riders-list">
                    ${topRiderDetails.map((rider, index) => `
                        <div class="top-rider-item">
                            <div class="top-rider-position">
                                <span class="position-badge ${getPositionClass(index + 1)}">${index + 1}</span>
                            </div>
                            <div class="top-rider-photo">
                                <img src="${rider.photo}" alt="${rider.rider_name}"
                                     onerror="this.style.display='none'; this.parentElement.innerHTML='👨‍🦰';"
                                     loading="lazy">
                            </div>
                            <div class="top-rider-info">
                                <div class="top-rider-name">${rider.rider_name}</div>
                                <div class="top-rider-meta">
                                    <span class="top-rider-flag">${rider.flag}</span>
                                    <span class="top-rider-team">${getTeamName(rider.team)}</span>
                                </div>
                            </div>
                            <div class="top-rider-stats">
                                <div class="top-rider-points">${rider.points} pts</div>
                                <div class="top-rider-wins">${rider.wins} wins</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="preview-unavailable">
                    <p>Championship standings temporarily unavailable</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Failed to load top riders:', error);
        container.innerHTML = `
            <div class="preview-unavailable">
                <p>Unable to load championship standings</p>
            </div>
        `;
    }
}

/**
 * Get team name by ID
 */
function getTeamName(teamId) {
    if (!teamId || !RidersPage.allTeams.length) return 'Unknown Team';

    const team = RidersPage.allTeams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
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
 * Show rider details (modal or alert)
 */
function showRiderDetails(riderId) {
    const rider = RidersPage.allRiders.find(r => r.id === riderId);
    if (rider) {
        // Create detailed rider information
        const details = `
🏍️ ${rider.name}
🏁 ${rider.flag} ${rider.nationality}
🔢 Number: ${rider.number}
🏁 Team: ${getTeamName(rider.team)}
📅 Age: ${rider.age} years old
🎯️ Debut: ${rider.debut_year}

📊 Career Statistics:
🏆 Career Wins: ${rider.career_wins}
🥈 Career Podiums: ${rider.career_podiums}
🎖️ Career Pole Positions: ${rider.career_poles}
🏆 World Championships: ${rider.world_championships}
📊 2025 Points: ${rider.points_2025 || 0}

💡 About:
This talented rider represents ${getTeamName(rider.team)} in the 2025 MotoGP World Championship.
        `;

        // Show details in a modal or alert
        if (typeof showModal === 'function') {
            showModal('Rider Details', details);
        } else {
            alert(details);
        }
    }
}

/**
 * Show loading state
 */
function showLoading(show = true) {
    RidersPage.isLoading = show;
    const loadingEl = document.getElementById('ridersLoading');
    const gridEl = document.getElementById('ridersGrid');

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
    const loadingEl = document.getElementById('ridersLoading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div class="error-message text-center">
                <p>Failed to load riders data. Please try refreshing the page.</p>
                <button class="btn btn-primary mt-4" onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

/**
 * Reset all filters
 */
function resetFilters() {
    const teamFilter = document.getElementById('teamFilter');
    const nationalityFilter = document.getElementById('nationalityFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');

    if (teamFilter) teamFilter.value = '';
    if (nationalityFilter) nationalityFilter.value = '';
    if (sortFilter) sortFilter.value = 'number';
    if (searchInput) searchInput.value = '';

    RidersPage.currentFilter = { team: '', nationality: '', search: '' };
    RidersPage.currentSort = 'number';

    applyFilters();
}

// Export functions for global access
window.RidersPage = {
    init: initRidersPageModule,
    loadRidersData,
    loadTeamsData,
    renderRiders,
    switchView,
    showRiderDetails,
    loadTopRidersPreview,
    resetFilters,
    getTeamName
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRidersPageModule);
} else {
    initRidersPageModule();
}