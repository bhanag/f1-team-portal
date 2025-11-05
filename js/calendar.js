/**
 * MotoGP Team Portal - Calendar Page JavaScript
 * Handles race calendar, date calculations, and event displays
 */

// Calendar page state
const CalendarPage = {
    allRaces: [],
    filteredRaces: [],
    currentView: 'calendar',
    currentFilter: { status: '', continent: '', search: '' },
    isLoading: false,
    nextRace: null
};

/**
 * Initialize calendar page
 */
async function initCalendarPageModule() {
    console.log('📅 Initializing calendar page module...');

    try {
        // Initialize event listeners
        initializeEventListeners();

        // Load calendar data
        await loadCalendarData();

        // Update race statuses
        updateRaceStatuses();

        // Render calendar
        renderCalendar();
        renderRaceList();

        // Load next race banner
        await loadNextRaceBanner();

        // Update season progress
        updateSeasonProgress();

        console.log('✅ Calendar page module initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize calendar page module:', error);
        showError('Failed to load calendar data. Please refresh the page.');
    }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            CalendarPage.currentFilter.status = e.target.value;
            applyFilters();
        });
    }

    // Continent filter
    const continentFilter = document.getElementById('continentFilter');
    if (continentFilter) {
        continentFilter.addEventListener('change', (e) => {
            CalendarPage.currentFilter.continent = e.target.value;
            applyFilters();
        });
    }

    // Search filter
    const raceSearch = document.getElementById('raceSearch');
    if (raceSearch) {
        raceSearch.addEventListener('input', debounce((e) => {
            CalendarPage.currentFilter.search = e.target.value.trim().toLowerCase();
            applyFilters();
        }, 300));
    }
}

/**
 * Load calendar data
 */
async function loadCalendarData() {
    const loadingEl = document.getElementById('calendarLoading');
    const calendarGrid = document.getElementById('calendarGrid');

    try {
        showLoading(true);

        // Get calendar from cache or fetch
        let calendar = window.motoGPState.cache.calendar;

        if (!calendar) {
            const dataFetcher = new DataFetcher();
            calendar = await dataFetcher.fetchCalendar();
        }

        if (!calendar || calendar.length === 0) {
            throw new Error('No calendar data available');
        }

        // Sort races by date
        CalendarPage.allRaces = calendar.sort((a, b) => new Date(a.date) - new Date(b.date));
        CalendarPage.filteredRaces = CalendarPage.allRaces;

        hideLoading();
        renderCalendar();
        renderRaceList();

    } catch (error) {
        console.error('Failed to load calendar:', error);
        showLoadingError(error);
    }
}

/**
 * Update race statuses based on current date
 */
function updateRaceStatuses() {
    const now = new Date();

    CalendarPage.allRaces.forEach((race, index) => {
        const raceDate = new Date(race.date);
        const raceEndDate = new Date(race.date_end || race.date);

        if (raceEndDate < now) {
            race.status = 'completed';
        } else if (raceDate <= now && raceEndDate >= now) {
            race.status = 'in-progress';
        } else {
            race.status = 'upcoming';
        }

        // Mark next race
        if (race.status === 'upcoming' && !CalendarPage.allRaces.find(r => r.status === 'next')) {
            race.status = 'next';
            CalendarPage.nextRace = race;
        }
    });
}

/**
 * Apply filters to races
 */
function applyFilters() {
    const { status, continent, search } = CalendarPage.currentFilter;

    CalendarPage.filteredRaces = CalendarPage.allRaces.filter(race => {
        const matchesStatus = !status || race.status === status;
        const matchesContinent = !continent || race.continent === continent;
        const matchesSearch = !search ||
            race.name.toLowerCase().includes(search) ||
            race.circuit.toLowerCase().includes(search) ||
            race.country.toLowerCase().includes(search);

        return matchesStatus && matchesContinent && matchesSearch;
    });

    // Re-render current view
    if (CalendarPage.currentView === 'calendar') {
        renderCalendar();
    } else if (CalendarPage.currentView === 'list') {
        renderRaceList();
    }
}

/**
 * Switch between views
 */
function switchView(view) {
    CalendarPage.currentView = view;

    // Hide all views
    document.getElementById('calendarView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    document.getElementById('mapView').style.display = 'none';

    // Show selected view
    switch (view) {
        case 'calendar':
            document.getElementById('calendarView').style.display = 'block';
            break;
        case 'list':
            document.getElementById('listView').style.display = 'block';
            renderRaceList();
            break;
        case 'map':
            document.getElementById('mapView').style.display = 'block';
            break;
    }
}

/**
 * Render calendar grid view
 */
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    // Group races by month
    const racesByMonth = {};
    CalendarPage.filteredRaces.forEach(race => {
        const date = new Date(race.date);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!racesByMonth[monthYear]) {
            racesByMonth[monthYear] = [];
        }
        racesByMonth[monthYear].push(race);
    });

    // Generate calendar HTML
    let calendarHTML = '';
    const monthNames = Object.keys(racesByMonth).sort((a, b) => new Date(a) - new Date(b));

    monthNames.forEach(month => {
        const races = racesByMonth[month];
        const firstRace = new Date(races[0].date);
        const year = firstRace.getFullYear();
        const monthIndex = firstRace.getMonth();

        calendarHTML += `
            <div class="calendar-month">
                <div class="month-header">
                    <h3 class="month-title">${month}</h3>
                    <div class="month-stats">${races.length} race${races.length !== 1 ? 's' : ''}</div>
                </div>
                <div class="month-grid">
                    ${generateMonthGrid(year, monthIndex, races)}
                </div>
            </div>
        `;
    });

    calendarGrid.innerHTML = calendarHTML;
}

/**
 * Generate calendar grid for a month
 */
function generateMonthGrid(year, month, races) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    let gridHTML = '<div class="calendar-weekdays">';
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        gridHTML += `<div class="calendar-weekday">${day}</div>`;
    });
    gridHTML += '</div><div class="calendar-days">';

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        gridHTML += '<div class="calendar-day empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateString = currentDate.toISOString().split('T')[0];
        const dayRaces = races.filter(race => race.date === dateString);

        const isToday = currentDate.toDateString() === today.toDateString();
        const isPast = currentDate < today;

        let raceContent = '';
        if (dayRaces.length > 0) {
            const race = dayRaces[0];
            raceContent = `
                <div class="race-marker ${race.status}" onclick="CalendarPage.showRaceDetails('${race.id}')">
                    <div class="race-marker-flag">${race.flag}</div>
                    <div class="race-marker-info">
                        <div class="race-marker-name">${getShortRaceName(race.name)}</div>
                        <div class="race-marker-circuit">${getShortCircuitName(race.circuit)}</div>
                    </div>
                </div>
            `;
        }

        gridHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}">
                <div class="day-number">${day}</div>
                ${raceContent}
            </div>
        `;
    }

    gridHTML += '</div>';
    return gridHTML;
}

/**
 * Render race list view
 */
function renderRaceList() {
    const racesList = document.getElementById('racesList');
    if (!racesList) return;

    if (CalendarPage.filteredRaces.length === 0) {
        racesList.innerHTML = `
            <div class="no-results text-center py-12">
                <div class="no-results-icon mb-4">
                    <span style="font-size: 4rem;">🔍</span>
                </div>
                <h3 class="text-2xl font-semibold mb-2">No Races Found</h3>
                <p class="text-secondary mb-4">Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    racesList.innerHTML = CalendarPage.filteredRaces.map((race, index) => `
        <div class="race-list-item card ${race.status}" onclick="CalendarPage.showRaceDetails('${race.id}')">
            <div class="card-body">
                <div class="race-list-content">
                    <div class="race-list-date">
                        <div class="race-date-day">${new Date(race.date).getDate()}</div>
                        <div class="race-date-month">${new Date(race.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    </div>
                    <div class="race-list-flag">${race.flag}</div>
                    <div class="race-list-info">
                        <h3 class="race-list-name">${race.name}</h3>
                        <p class="race-list-circuit">${race.circuit}</p>
                        <div class="race-list-meta">
                            <span class="race-status ${race.status}">${getRaceStatusText(race.status)}</span>
                            <span class="race-continent">${race.continent}</span>
                        </div>
                    </div>
                    <div class="race-list-results">
                        ${getRaceResultsDisplay(race)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Load next race banner
 */
async function loadNextRaceBanner() {
    const bannerEl = document.getElementById('nextRaceBanner');
    if (!bannerEl) return;

    try {
        const nextRace = CalendarPage.allRaces.find(race => race.status === 'next' || race.status === 'in-progress');

        if (nextRace) {
            const timeUntil = formatTimeRemaining(nextRace.date);
            bannerEl.innerHTML = `
                <div class="next-race-content">
                    <div class="next-race-header">
                        <span class="next-race-label">${nextRace.status === 'in-progress' ? 'RACING NOW' : 'NEXT RACE'}</span>
                        <span class="next-race-countdown">${timeUntil}</span>
                    </div>
                    <div class="next-race-details">
                        <div class="next-race-flag">${nextRace.flag}</div>
                        <div class="next-rider-info">
                            <h3 class="next-race-name">${nextRace.name}</h3>
                            <p class="next-race-circuit">${nextRace.circuit}</p>
                        </div>
                        <button class="btn btn-primary" onclick="CalendarPage.showRaceDetails('${nextRace.id}')">
                            Race Details
                        </button>
                    </div>
                </div>
            `;
        } else {
            bannerEl.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to load next race:', error);
        bannerEl.style.display = 'none';
    }
}

/**
 * Update season progress
 */
function updateSeasonProgress() {
    const completedRaces = CalendarPage.allRaces.filter(race => race.status === 'completed').length;
    const totalRaces = CalendarPage.allRaces.length;
    const progressPercent = Math.round((completedRaces / totalRaces) * 100);

    // Update progress displays
    const completedEl = document.getElementById('completedRaces');
    const remainingEl = document.getElementById('remainingRaces');
    const progressEl = document.getElementById('seasonProgress');
    const progressFill = document.getElementById('progressFill');

    if (completedEl) completedEl.textContent = completedRaces;
    if (remainingEl) remainingEl.textContent = totalRaces - completedRaces;
    if (progressEl) progressEl.textContent = `${progressPercent}%`;
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
}

/**
 * Show race details
 */
function showRaceDetails(raceId) {
    const race = CalendarPage.allRaces.find(r => r.id === raceId);
    if (race) {
        const results = race.winner ? `
Winner: ${race.winner}
Pole Position: ${race.pole_position}
Fastest Lap: ${race.fastest_lap}
                ` : 'Upcoming race';

        const details = `
🏁 ${race.name}
🏍️ ${race.circuit}
${race.flag} ${race.country}
📅 ${formatDate(race.date, 'long')}

🏆 Race Results:
${results}
        `;

        // Show details in a modal or alert
        if (typeof showModal === 'function') {
            showModal('Race Details', details);
        } else {
            alert(details);
        }
    }
}

/**
 * Format time remaining until race
 */
function formatTimeRemaining(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    if (diff <= 0) return 'Completed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

/**
 * Format date
 */
function formatDate(dateString, format = 'short') {
    const date = new Date(dateString);

    const options = {
        short: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    return date.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Get short race name
 */
function getShortRaceName(name) {
    return name.replace('Grand Prix of', '').replace('Gran Premio di', '').replace('Grand Prix', '').trim();
}

/**
 * Get short circuit name
 */
function getShortCircuitName(circuit) {
    return circuit.replace('International Circuit', 'Int.').replace('Circuit', '').trim();
}

/**
 * Get race status text
 */
function getRaceStatusText(status) {
    const statusMap = {
        'completed': 'Completed',
        'in-progress': 'Racing Now',
        'upcoming': 'Upcoming',
        'next': 'Next Race'
    };
    return statusMap[status] || status;
}

/**
 * Get race results display
 */
function getRaceResultsDisplay(race) {
    if (race.status === 'completed' && race.winner) {
        return `
            <div class="race-winner">
                <div class="winner-label">Winner</div>
                <div class="winner-name">${race.winner}</div>
            </div>
        `;
    } else if (race.status === 'in-progress') {
        return '<span class="race-status live">🔴 LIVE</span>';
    } else if (race.status === 'next') {
        return '<span class="race-status next">NEXT RACE</span>';
    } else {
        return `<span class="race-date">${formatDate(race.date, 'short')}</span>`;
    }
}

/**
 * Show loading state
 */
function showLoading(show = true) {
    CalendarPage.isLoading = show;
    const loadingEl = document.getElementById('calendarLoading');

    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
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
    const loadingEl = document.getElementById('calendarLoading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div class="error-message text-center">
                <p>Failed to load calendar data. Please try refreshing the page.</p>
                <button class="btn btn-primary mt-4" onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

/**
 * Refresh calendar data
 */
async function refreshCalendar() {
    try {
        // Clear cache and fetch fresh data
        const cacheManager = window.cacheManager || new CacheManager();
        await cacheManager.delete('calendar');

        const dataFetcher = new DataFetcher();
        CalendarPage.allRaces = await dataFetcher.fetchCalendar();
        await cacheManager.set('calendar', CalendarPage.allRaces);

        // Update race statuses and re-render
        updateRaceStatuses();
        renderCalendar();
        renderRaceList();
        loadNextRaceBanner();
        updateSeasonProgress();

        if (window.motoGPApp && window.motoGPApp.showSuccess) {
            window.motoGPApp.showSuccess('Calendar refreshed successfully!');
        }

    } catch (error) {
        console.error('Failed to refresh calendar:', error);
        if (window.motoGPApp && window.motoGPApp.showError) {
            window.motoGPApp.showError('Failed to refresh calendar. Please try again.');
        }
    }
}

// Export functions for global access
window.CalendarPage = {
    init: initCalendarPageModule,
    loadCalendarData,
    renderCalendar,
    renderRaceList,
    switchView,
    showRaceDetails,
    formatTimeRemaining,
    formatDate,
    refreshCalendar,
    updateRaceStatuses,
    updateSeasonProgress
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendarPageModule);
} else {
    initCalendarPageModule();
}