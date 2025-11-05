/**
 * MotoGP Team Portal - Data Fetcher
 * Handles API requests and data parsing from official MotoGP sources
 */

class DataFetcher {
  constructor() {
    // CORS proxy for development
    this.proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    // Official MotoGP URLs
    this.urls = {
      teams: 'https://www.motogp.com/en/teams/motogp',
      riders: 'https://www.motogp.com/en/riders/motogp',
      calendar: 'https://www.motogp.com/en/calendar',
      standings: 'https://www.motogp.com/en/world-standing/2025/motogp/championship-standings',
      results: 'https://www.motogp.com/en/gp-results'
    };

    // Fallback data URLs
    this.fallbackUrls = {
      teams: '/data/teams-fallback.json',
      riders: '/data/riders-fallback.json',
      calendar: '/data/calendar-fallback.json',
      standings: '/data/standings-fallback.json'
    };

    // Request timeout
    this.timeout = 10000; // 10 seconds

    // Retry configuration
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Generic fetch method with retry logic
   */
  async fetchWithRetry(url, options = {}, retryCount = 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      console.warn(`Fetch attempt ${retryCount + 1} failed:`, error.message);

      if (retryCount < this.maxRetries) {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Fetch and parse team data
   */
  async fetchTeams() {
    console.log('🏁 Fetching teams data...');

    try {
      // Try to fetch from official source
      const teams = await this.fetchTeamsFromOfficial();
      return teams;

    } catch (error) {
      console.warn('⚠️ Failed to fetch from official source, using fallback:', error.message);
      return this.fetchTeamsFromFallback();
    }
  }

  /**
   * Fetch teams from official MotoGP source
   */
  async fetchTeamsFromOfficial() {
    const url = this.proxyUrl + this.urls.teams;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();

    // Parse HTML content
    const teams = this.parseTeamsFromHTML(html);

    return teams;
  }

  /**
   * Parse teams from HTML content
   */
  parseTeamsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const teams = [];

    // Find team cards or listings
    const teamElements = doc.querySelectorAll('.team_card, .team-item, .team');

    teamElements.forEach((element, index) => {
      try {
        const team = this.extractTeamData(element, index);
        if (team) {
          teams.push(team);
        }
      } catch (error) {
        console.warn(`Failed to parse team element ${index}:`, error.message);
      }
    });

    // If no teams found, return hardcoded 2025 data
    if (teams.length === 0) {
      return this.getHardcodedTeamsData();
    }

    return teams;
  }

  /**
   * Extract team data from DOM element
   */
  extractTeamData(element, index) {
    const nameEl = element.querySelector('.team_name, h3, .name') || element;
    const manufacturerEl = element.querySelector('.manufacturer, .brand') || element;
    const logoEl = element.querySelector('img');
    const linkEl = element.querySelector('a');

    const name = nameEl.textContent?.trim() || `Team ${index + 1}`;
    const manufacturer = manufacturerEl.textContent?.trim() || this.extractManufacturerFromName(name);
    const logo = logoEl?.src || '';
    const teamUrl = linkEl?.href || '';

    return {
      id: this.generateTeamId(name),
      name,
      manufacturer,
      base: this.getTeamBase(name),
      team_principal: this.getTeamPrincipal(name),
      website: this.getTeamWebsite(name),
      logo,
      color: this.getTeamColor(name),
      hero_image: logo,
      riders: []
    };
  }

  /**
   * Fetch teams from fallback data
   */
  async fetchTeamsFromFallback() {
    try {
      const response = await fetch(this.fallbackUrls.teams);
      const data = await response.json();
      return data.teams || [];
    } catch (error) {
      console.error('Failed to load fallback teams data:', error);
      return this.getHardcodedTeamsData();
    }
  }

  /**
   * Get hardcoded 2025 teams data
   */
  getHardcodedTeamsData() {
    return [
      {
        id: "ducati-lenovo",
        name: "Ducati Lenovo Team",
        manufacturer: "Ducati",
        base: "Bologna, Italy",
        team_principal: "Davide Tardozzi",
        website: "https://www.ducati.com",
        logo: "/images/logos/ducati-lenovo.png",
        color: "#DC143C",
        hero_image: "/images/heroes/ducati-hero.jpg",
        riders: ["francesco-bagnaia", "marc-marquez"]
      },
      {
        id: "aprilia-racing",
        name: "Aprilia Racing",
        manufacturer: "Aprilia",
        base: "Noale, Italy",
        team_principal: "Massimo Rivola",
        website: "https://www.aprilia.com",
        logo: "/images/logos/aprilia-racing.png",
        color: "#4A90E2",
        hero_image: "/images/heroes/aprilia-hero.jpg",
        riders: ["jorge-martin", "marco-bezzecchi"]
      },
      {
        id: "monster-yamaha",
        name: "Monster Energy Yamaha MotoGP",
        manufacturer: "Yamaha",
        base: "Iwata, Japan",
        team_principal: "Lin Jarvis",
        website: "https://www.yamaha-racing.com",
        logo: "/images/logos/yamaha-monster.png",
        color: "#0066CC",
        hero_image: "/images/heroes/yamaha-hero.jpg",
        riders: ["fabio-quartararo", "alex-rins"]
      },
      {
        id: "redbull-ktm",
        name: "Red Bull KTM Factory Racing",
        manufacturer: "KTM",
        base: "Mattighofen, Austria",
        team_principal: "Francesco Guidotti",
        website: "https://www.ktm.com",
        logo: "/images/logos/ktm-redbull.png",
        color: "#FF6600",
        hero_image: "/images/heroes/ktm-hero.jpg",
        riders: ["brad-binder", "pedro-acosta"]
      },
      {
        id: "honda-castrol",
        name: "Honda HRC Castrol",
        manufacturer: "Honda",
        base: "Aoyama, Japan",
        team_principal: "Alberto Puig",
        website: "https://www.hondaracing.com",
        logo: "/images/logos/honda-castrol.png",
        color: "#FF8C00",
        hero_image: "/images/heroes/honda-hero.jpg",
        riders: ["luca-marini", "joan-mir"]
      },
      {
        id: "lcr-honda",
        name: "LCR Honda",
        manufacturer: "Honda",
        base: "Montichiari, Italy",
        team_principal: "Lucio Cecchinello",
        website: "https://www.lcrhonda.com",
        logo: "/images/logos/lcr-honda.png",
        color: "#FFD700",
        hero_image: "/images/heroes/lcr-hero.jpg",
        riders: ["johann-zarco", "somkiat-chantra"]
      },
      {
        id: "gresini-racing",
        name: "BK8 Gresini Racing MotoGP",
        manufacturer: "Ducati",
        base: "Faenza, Italy",
        team_principal: "Nadia Gresini",
        website: "https://www.gresiniracing.com",
        logo: "/images/logos/gresini-bk8.png",
        color: "#8B0000",
        hero_image: "/images/heroes/gresini-hero.jpg",
        riders: ["fermin-aldeguer", "alex-marquez"]
      },
      {
        id: "vr46-racing",
        name: "Pertamina Enduro VR46 Racing Team",
        manufacturer: "Ducati",
        base: "Tavullia, Italy",
        team_principal: "Uccio Salucci",
        website: "https://www.vr46.com",
        logo: "/images/logos/vr46-pertamina.png",
        color: "#FFD700",
        hero_image: "/images/heroes/vr46-hero.jpg",
        riders: ["franco-morbidelli", "fabio-di-giannantonio"]
      },
      {
        id: "prima-pramac",
        name: "Prima Pramac Yamaha MotoGP",
        manufacturer: "Yamaha",
        base: "Casole d'Elsa, Italy",
        team_principal: "Francesco Neri",
        website: "https://www.pramacracing.com",
        logo: "/images/logos/pramac-yamaha.png",
        color: "#003366",
        hero_image: "/images/heroes/pramac-hero.jpg",
        riders: ["jack-miller", "miguel-oliveira"]
      },
      {
        id: "ktm-tech3",
        name: "Red Bull KTM Tech3",
        manufacturer: "KTM",
        base: "Bormes-les-Mimosas, France",
        team_principal: "Herve Poncharal",
        website: "https://www.tech3racing.com",
        logo: "/images/logos/tech3-ktm.png",
        color: "#003300",
        hero_image: "/images/heroes/tech3-hero.jpg",
        riders: ["maverick-vinales", "enea-bastianini"]
      },
      {
        id: "trackhouse",
        name: "Trackhouse MotoGP Team",
        manufacturer: "Aprilia",
        base: "Statesville, USA",
        team_principal: "Justin Marks",
        website: "https://www.trackhousemotorsports.com",
        logo: "/images/logos/trackhouse.png",
        color: "#000000",
        hero_image: "/images/heroes/trackhouse-hero.jpg",
        riders: ["raul-fernandez", "takaaki-nakagami"]
      },
      {
        id: "rnf-racing",
        name: "RNF Racing",
        manufacturer: "Ducati",
        base: "Barcelona, Spain",
        team_principal: "Razlan Razali",
        website: "https://www.rnfmotorsport.com",
        logo: "/images/logos/rnf-ducati.png",
        color: "#004080",
        hero_image: "/images/heroes/rnf-hero.jpg",
        riders: ["miguel-oliveira", "raul-fernandez"]
      }
    ];
  }

  /**
   * Fetch and parse rider data
   */
  async fetchRiders() {
    console.log('👨‍🦰 Fetching riders data...');

    try {
      const riders = await this.fetchRidersFromOfficial();
      return riders;

    } catch (error) {
      console.warn('⚠️ Failed to fetch from official source, using fallback:', error.message);
      return this.fetchRidersFromFallback();
    }
  }

  /**
   * Fetch riders from official MotoGP source
   */
  async fetchRidersFromOfficial() {
    const url = this.proxyUrl + this.urls.riders;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();

    const riders = this.parseRidersFromHTML(html);
    return riders;
  }

  /**
   * Parse riders from HTML content
   */
  parseRidersFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const riders = [];
    const riderElements = doc.querySelectorAll('.rider_card, .rider-item, .rider');

    riderElements.forEach((element, index) => {
      try {
        const rider = this.extractRiderData(element, index);
        if (rider) {
          riders.push(rider);
        }
      } catch (error) {
        console.warn(`Failed to parse rider element ${index}:`, error.message);
      }
    });

    if (riders.length === 0) {
      return this.getHardcodedRidersData();
    }

    return riders;
  }

  /**
   * Extract rider data from DOM element
   */
  extractRiderData(element, index) {
    const nameEl = element.querySelector('.rider_name, h3, .name') || element;
    const numberEl = element.querySelector('.rider_number, .number') || element;
    const nationalityEl = element.querySelector('.nationality, .country') || element;
    const photoEl = element.querySelector('img');

    const name = nameEl.textContent?.trim() || `Rider ${index + 1}`;
    const number = parseInt(numberEl.textContent?.trim()) || index + 1;
    const nationality = nationalityEl.textContent?.trim() || 'Unknown';
    const photo = photoEl?.src || '';

    return {
      id: this.generateRiderId(name),
      name,
      number,
      nationality,
      flag: this.getCountryFlag(nationality),
      team: this.getRiderTeam(name),
      age: this.getRiderAge(name),
      photo,
      career_wins: 0,
      career_podiums: 0,
      career_poles: 0,
      world_championships: 0,
      points_2025: 0,
      debut_year: 2020
    };
  }

  /**
   * Fetch riders from fallback data
   */
  async fetchRidersFromFallback() {
    try {
      const response = await fetch(this.fallbackUrls.riders);
      const data = await response.json();
      return data.riders || [];
    } catch (error) {
      console.error('Failed to load fallback riders data:', error);
      return this.getHardcodedRidersData();
    }
  }

  /**
   * Get hardcoded riders data
   */
  getHardcodedRidersData() {
    return [
      {
        id: "francesco-bagnaia",
        name: "Francesco Bagnaia",
        number: 1,
        nationality: "Italy",
        flag: "🇮🇹",
        team: "ducati-lenovo",
        age: 28,
        photo: "/images/riders/bagnaia.jpg",
        career_wins: 21,
        career_podiums: 53,
        career_poles: 22,
        world_championships: 2,
        points_2025: 0,
        debut_year: 2019
      },
      {
        id: "marc-marquez",
        name: "Marc Márquez",
        number: 93,
        nationality: "Spain",
        flag: "🇪🇸",
        team: "ducati-lenovo",
        age: 32,
        photo: "/images/riders/marquez.jpg",
        career_wins: 86,
        career_podiums: 134,
        career_poles: 70,
        world_championships: 8,
        points_2025: 0,
        debut_year: 2013
      }
      // Include more riders as needed...
    ];
  }

  /**
   * Fetch and parse calendar data
   */
  async fetchCalendar() {
    console.log('📅 Fetching calendar data...');

    try {
      const calendar = await this.fetchCalendarFromOfficial();
      return calendar;

    } catch (error) {
      console.warn('⚠️ Failed to fetch from official source, using fallback:', error.message);
      return this.fetchCalendarFromFallback();
    }
  }

  /**
   * Fetch calendar from official MotoGP source
   */
  async fetchCalendarFromOfficial() {
    const url = this.proxyUrl + this.urls.calendar;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();

    const calendar = this.parseCalendarFromHTML(html);
    return calendar;
  }

  /**
   * Parse calendar from HTML content
   */
  parseCalendarFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const races = [];
    const raceElements = doc.querySelectorAll('.race_item, .event, .calendar-item');

    raceElements.forEach((element, index) => {
      try {
        const race = this.extractRaceData(element, index);
        if (race) {
          races.push(race);
        }
      } catch (error) {
        console.warn(`Failed to parse race element ${index}:`, error.message);
      }
    });

    if (races.length === 0) {
      return this.getHardcodedCalendarData();
    }

    return races;
  }

  /**
   * Fetch calendar from fallback data
   */
  async fetchCalendarFromFallback() {
    try {
      const response = await fetch(this.fallbackUrls.calendar);
      const data = await response.json();
      return data.calendar || [];
    } catch (error) {
      console.error('Failed to load fallback calendar data:', error);
      return this.getHardcodedCalendarData();
    }
  }

  /**
   * Get hardcoded calendar data
   */
  getHardcodedCalendarData() {
    return [
      {
        id: "qatar",
        name: "Grand Prix of Qatar",
        circuit: "Losail International Circuit",
        country: "Qatar",
        flag: "🇶🇦",
        date: "2025-03-09",
        date_end: "2025-03-11",
        status: "completed",
        winner: "francesco-bagnaia",
        pole_position: "jorge-martin",
        fastest_lap: "pedro-acosta",
        continent: "Asia"
      }
      // Include more races as needed...
    ];
  }

  /**
   * Fetch and parse standings data
   */
  async fetchStandings() {
    console.log('🏆 Fetching standings data...');

    try {
      const standings = await this.fetchStandingsFromOfficial();
      return standings;

    } catch (error) {
      console.warn('⚠️ Failed to fetch from official source, using fallback:', error.message);
      return this.fetchStandingsFromFallback();
    }
  }

  /**
   * Fetch standings from official MotoGP source
   */
  async fetchStandingsFromOfficial() {
    const url = this.proxyUrl + this.urls.standings;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();

    const standings = this.parseStandingsFromHTML(html);
    return standings;
  }

  /**
   * Parse standings from HTML content
   */
  parseStandingsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const riderChampionship = [];
    const tableRows = doc.querySelectorAll('.standings_table tr, table tr');

    tableRows.forEach((row, index) => {
      if (index === 0) return; // Skip header

      try {
        const rider = this.extractStandingsData(row, index);
        if (rider) {
          riderChampionship.push(rider);
        }
      } catch (error) {
        console.warn(`Failed to parse standings row ${index}:`, error.message);
      }
    });

    if (riderChampionship.length === 0) {
      return this.getHardcodedStandingsData();
    }

    return {
      rider_championship: riderChampionship,
      team_championship: [],
      manufacturer_championship: []
    };
  }

  /**
   * Fetch standings from fallback data
   */
  async fetchStandingsFromFallback() {
    try {
      const response = await fetch(this.fallbackUrls.standings);
      const data = await response.json();
      return data.standings || {};
    } catch (error) {
      console.error('Failed to load fallback standings data:', error);
      return this.getHardcodedStandingsData();
    }
  }

  /**
   * Get hardcoded standings data
   */
  getHardcodedStandingsData() {
    return {
      rider_championship: [
        {
          position: 1,
          rider_id: "marc-marquez",
          rider_name: "Marc Márquez",
          team: "Ducati Lenovo Team",
          manufacturer: "Ducati",
          points: 156,
          wins: 3,
          podiums: 5,
          poles: 2,
          gap_to_leader: "0"
        }
        // Include more riders as needed...
      ],
      team_championship: [],
      manufacturer_championship: []
    };
  }

  // Helper methods
  generateTeamId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }

  generateRiderId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }

  extractManufacturerFromName(name) {
    const manufacturers = ['Ducati', 'Yamaha', 'Honda', 'KTM', 'Aprilia'];
    return manufacturers.find(m => name.toLowerCase().includes(m.toLowerCase())) || 'Unknown';
  }

  getTeamBase(name) {
    const bases = {
      'Ducati': 'Bologna, Italy',
      'Yamaha': 'Iwata, Japan',
      'Honda': 'Aoyama, Japan',
      'KTM': 'Mattighofen, Austria',
      'Aprilia': 'Noale, Italy'
    };
    return bases[this.extractManufacturerFromName(name)] || 'Unknown';
  }

  getTeamPrincipal(name) {
    const principals = {
      'Ducati Lenovo': 'Davide Tardozzi',
      'Aprilia Racing': 'Massimo Rivola',
      'Monster Energy Yamaha': 'Lin Jarvis',
      'Red Bull KTM': 'Francesco Guidotti',
      'Honda HRC': 'Alberto Puig'
    };
    return principals[name] || 'Unknown';
  }

  getTeamWebsite(name) {
    const websites = {
      'Ducati': 'https://www.ducati.com',
      'Aprilia': 'https://www.aprilia.com',
      'Yamaha': 'https://www.yamaha-racing.com',
      'KTM': 'https://www.ktm.com',
      'Honda': 'https://www.hondaracing.com'
    };
    return websites[this.extractManufacturerFromName(name)] || '#';
  }

  getTeamColor(name) {
    const colors = {
      'Ducati': '#DC143C',
      'Yamaha': '#0066CC',
      'Honda': '#FF8C00',
      'KTM': '#FF6600',
      'Aprilia': '#4A90E2'
    };
    return colors[this.extractManufacturerFromName(name)] || '#666666';
  }

  getCountryFlag(nationality) {
    const flags = {
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'France': '🇫🇷',
      'Australia': '🇦🇺',
      'South Africa': '🇿🇦',
      'Portugal': '🇵🇹',
      'Argentina': '🇦🇷',
      'Thailand': '🇹🇭',
      'Japan': '🇯🇵',
      'Germany': '🇩🇪',
      'Netherlands': '🇳🇱',
      'Finland': '🇫🇮',
      'UK': '🇬🇧',
      'Austria': '🇦🇹',
      'India': '🇮🇳',
      'Malaysia': '🇲🇾',
      'USA': '🇺🇸'
    };
    return flags[nationality] || '🏁';
  }

  getRiderTeam(name) {
    // This would ideally be determined by parsing team associations
    return 'unknown';
  }

  getRiderAge(name) {
    // This would ideally be determined by parsing birth dates
    return 25;
  }

  extractRaceData(element, index) {
    const nameEl = element.querySelector('.race_name, h3, .name') || element;
    const circuitEl = element.querySelector('.circuit, .track') || element;
    const dateEl = element.querySelector('.date, .time') || element;

    const name = nameEl.textContent?.trim() || `Race ${index + 1}`;
    const circuit = circuitEl.textContent?.trim() || 'Unknown Circuit';
    const date = dateEl.textContent?.trim() || '2025-01-01';

    return {
      id: this.generateRaceId(name),
      name,
      circuit,
      country: this.extractCountryFromCircuit(circuit),
      flag: this.getCountryFlag(this.extractCountryFromCircuit(circuit)),
      date: this.parseDate(date),
      status: 'upcoming',
      winner: null,
      pole_position: null,
      fastest_lap: null,
      continent: this.getContinent(this.extractCountryFromCircuit(circuit))
    };
  }

  extractStandingsData(row, index) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 3) return null;

    const position = parseInt(cells[0].textContent?.trim()) || index + 1;
    const riderName = cells[1].textContent?.trim() || `Rider ${index + 1}`;
    const team = cells[2].textContent?.trim() || 'Unknown Team';
    const points = parseInt(cells[3]?.textContent?.trim()) || 0;

    return {
      position,
      rider_id: this.generateRiderId(riderName),
      rider_name: riderName,
      team,
      manufacturer: 'Unknown',
      points,
      wins: 0,
      podiums: 0,
      poles: 0,
      gap_to_leader: position === 1 ? '0' : `${points - 156}`
    };
  }

  generateRaceId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }

  extractCountryFromCircuit(circuit) {
    const countries = {
      'Losail': 'Qatar',
      'Algarve': 'Portugal',
      'Americas': 'USA',
      'Termas de Río Hondo': 'Argentina',
      'Jerez': 'Spain',
      'Le Mans': 'France',
      'Barcelona': 'Spain',
      'Mugello': 'Italy',
      'Assen': 'Netherlands',
      'Sachsenring': 'Germany',
      'KymiRing': 'Finland',
      'Silverstone': 'UK',
      'Red Bull Ring': 'Austria',
      'Aragón': 'Spain',
      'Misano': 'San Marino',
      'Buddh': 'India',
      'Motegi': 'Japan',
      'Chang': 'Thailand',
      'Phillip Island': 'Australia',
      'Sepang': 'Malaysia',
      'Valencia': 'Spain'
    };

    for (const [circuit, country] of Object.entries(countries)) {
      if (circuit.toLowerCase().includes(circuit.toLowerCase())) {
        return country;
      }
    }

    return 'Unknown';
  }

  parseDate(dateString) {
    // Simple date parsing - would need more robust implementation
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getContinent(country) {
    const continents = {
      'Qatar': 'Asia',
      'Portugal': 'Europe',
      'USA': 'Americas',
      'Argentina': 'Americas',
      'Spain': 'Europe',
      'France': 'Europe',
      'Italy': 'Europe',
      'Netherlands': 'Europe',
      'Germany': 'Europe',
      'Finland': 'Europe',
      'UK': 'Europe',
      'Austria': 'Europe',
      'San Marino': 'Europe',
      'India': 'Asia',
      'Japan': 'Asia',
      'Thailand': 'Asia',
      'Australia': 'Oceania',
      'Malaysia': 'Asia'
    };
    return continents[country] || 'Unknown';
  }
}

// Export for global use
window.DataFetcher = DataFetcher;