/**
 * DATA-FETCHER.JS
 * Handles fetching F1 data from API, caching, and fallback strategies
 */

const CACHE_KEY = 'f1_teams_cache';
const CACHE_TIMESTAMP_KEY = 'f1_teams_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT = 5000; // 5 seconds

/**
 * Fetch teams data with fallback strategy:
 * 1. Check valid cache
 * 2. Fetch from Ergast API
 * 3. Use fallback JSON file
 * @returns {Promise<array>} - Array of team objects
 */
async function fetchTeamsData() {
    try {
        // Step 1: Check for valid cache
        const cachedData = getCachedTeams();
        if (cachedData) {
            console.log('Using cached team data');
            return cachedData;
        }

        // Step 2: Attempt to fetch from Ergast API
        try {
            const apiData = await fetchFromErgastAPI();
            if (apiData && apiData.length > 0) {
                cacheTeams(apiData);
                return apiData;
            }
        } catch (apiError) {
            console.warn('Ergast API failed, trying fallback:', apiError.message);
        }

        // Step 3: Fallback to local JSON file
        const fallbackData = await fetchFallbackJSON();
        if (fallbackData && fallbackData.teams && fallbackData.teams.length > 0) {
            cacheTeams(fallbackData.teams);
            return fallbackData.teams;
        }

        // Step 4: If all fail, return empty array and show error
        console.error('All data sources failed');
        return [];
    } catch (error) {
        console.error('Error in fetchTeamsData:', error);
        return [];
    }
}

/**
 * Fetch teams from Ergast API with timeout
 * @returns {Promise<array>} - Array of team objects
 */
async function fetchFromErgastAPI() {
    const url = 'http://ergast.com/api/f1/current/teams.json';

    return Promise.race([
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (!data.MRData || !data.MRData.TeamTable || !data.MRData.TeamTable.Teams) {
                    throw new Error('Invalid API response structure');
                }

                // Transform Ergast API data to our format
                return data.MRData.TeamTable.Teams.map(team => ({
                    id: team.name.toLowerCase().replace(/\s+/g, '-'),
                    name: team.name,
                    logo: `/images/logos/${team.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
                    country: team.nationality,
                    founded: parseInt(team.established) || new Date().getFullYear(),
                    principal: 'Team Principal',
                    powerUnit: team.constructor || 'Mercedes',
                    championships: 0,
                    wins: 0,
                    podiums: 0,
                    accent_color: getTeamAccentColor(team.name),
                    drivers: [],
                    website: team.url || '#',
                    social: {
                        twitter: '#',
                        instagram: '#'
                    }
                }));
            }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout')), FETCH_TIMEOUT)
        )
    ]);
}

/**
 * Fetch fallback JSON file
 * @returns {Promise<object>} - Team data object
 */
async function fetchFallbackJSON() {
    try {
        const response = await fetch('data/teams.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch fallback JSON:', error);
        return null;
    }
}

/**
 * Get a single team by ID
 * @param {string} teamId - The team ID
 * @param {array} teamsArray - Array of team objects
 * @returns {object|null} - The team object or null
 */
function getTeamById(teamId, teamsArray) {
    if (!teamsArray || !Array.isArray(teamsArray)) {
        return null;
    }
    return teamsArray.find(team => team.id === teamId.toLowerCase()) || null;
}

/**
 * Find team by name (case-insensitive)
 * @param {string} teamName - The team name
 * @param {array} teamsArray - Array of team objects
 * @returns {object|null} - The team object or null
 */
function getTeamByName(teamName, teamsArray) {
    if (!teamsArray || !Array.isArray(teamsArray)) {
        return null;
    }
    return teamsArray.find(team => team.name.toLowerCase() === teamName.toLowerCase()) || null;
}

/**
 * Filter teams by search query
 * @param {string} query - Search query
 * @param {array} teamsArray - Array of team objects
 * @returns {array} - Filtered team array
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
 * Cache teams data to localStorage
 * @param {array} teamsArray - Array of team objects to cache
 */
function cacheTeams(teamsArray) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(teamsArray));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.warn('Failed to cache teams data:', error);
    }
}

/**
 * Get cached teams from localStorage if valid
 * @returns {array|null} - Cached teams array or null if invalid/expired
 */
function getCachedTeams() {
    try {
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!timestamp) return null;

        // Check if cache is expired
        if (Date.now() - parseInt(timestamp) > CACHE_DURATION) {
            clearCache();
            return null;
        }

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) return null;

        return JSON.parse(cachedData);
    } catch (error) {
        console.warn('Failed to retrieve cached teams:', error);
        clearCache();
        return null;
    }
}

/**
 * Check if cache is expired
 * @returns {boolean} - True if cache is expired or doesn't exist
 */
function isCacheExpired() {
    try {
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!timestamp) return true;
        return Date.now() - parseInt(timestamp) > CACHE_DURATION;
    } catch (error) {
        return true;
    }
}

/**
 * Clear cached teams data
 */
function clearCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
        console.warn('Failed to clear cache:', error);
    }
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
        'ferrari': '#FF1801',
        'mclaren': '#FF8700',
        'alpine': '#0093D0',
        'aston martin': '#006F62',
        'williams': '#005AFF',
        'alfa romeo': '#900000',
        'haas': '#FFFFFF',
        'alpha tauri': '#2B4562'
    };

    const normalized = teamName.toLowerCase().trim();
    return colors[normalized] || '#FF1801';
}

/**
 * Fetch driver data from Ergast API
 * @param {string} teamId - The team ID or constructor ID
 * @returns {Promise<array>} - Array of driver objects
 */
async function fetchDriverData(teamId) {
    try {
        const url = `http://ergast.com/api/f1/current/drivers.json`;
        const response = await Promise.race([
            fetch(url),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), FETCH_TIMEOUT)
            )
        ]);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.MRData && data.MRData.DriverTable && data.MRData.DriverTable.Drivers) {
            return data.MRData.DriverTable.Drivers.map(driver => ({
                id: driver.driverId,
                name: `${driver.givenName} ${driver.familyName}`,
                number: driver.permanentNumber || '0',
                nationality: driver.nationality,
                image: `/images/drivers/${driver.driverId}.jpg`,
                points: 0,
                races: 0,
                wins: 0
            }));
        }
    } catch (error) {
        console.warn('Failed to fetch driver data:', error);
    }
    return [];
}
