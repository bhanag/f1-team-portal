/**
 * MotoGP Team Portal - Main Application JavaScript
 * Core functionality and application initialization
 */

// Global Application State
window.motoGPState = {
  currentPage: 'home',
  theme: 'dark',
  isLoading: false,
  cache: {},
  settings: {
    autoRefresh: true,
    refreshInterval: 30 * 60 * 1000, // 30 minutes
    animationsEnabled: true,
    reducedMotion: false
  }
};

// DOM Elements
const elements = {
  header: null,
  navLinks: null,
  mobileMenuToggle: null,
  mobileNav: null,
  searchInput: null,
  themeToggle: null,
  loadingOverlay: null,
  content: null
};

/**
 * Initialize the application
 */
async function initApp() {
  console.log('🏍️ MotoGP Team Portal - Initializing...');

  try {
    // Cache DOM elements
    cacheElements();

    // Check for reduced motion preference
    checkReducedMotion();

    // Initialize theme
    initTheme();

    // Initialize navigation
    initNavigation();

    // Initialize search functionality
    initSearch();

    // Initialize mobile menu
    initMobileMenu();

    // Load initial data
    await loadInitialData();

    // Setup auto-refresh
    setupAutoRefresh();

    // Initialize animations
    initAnimations();

    // Show success message
    console.log('✅ MotoGP Team Portal - Ready!');

  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    showError('Failed to load application. Please refresh the page.');
  }
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
  elements.header = document.querySelector('.header');
  elements.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  elements.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  elements.mobileNav = document.querySelector('.mobile-nav');
  elements.searchInput = document.querySelector('.search-input');
  elements.themeToggle = document.querySelector('.theme-toggle');
  elements.loadingOverlay = document.querySelector('.loading-overlay');
  elements.content = document.querySelector('.content') || document.body;
}

/**
 * Check for reduced motion preference
 */
function checkReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.motoGPState.settings.animationsEnabled = false;
    window.motoGPState.settings.reducedMotion = true;
    document.body.classList.add('reduced-motion');
  }
}

/**
 * Initialize theme based on user preference or system preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem('motogp-theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const theme = savedTheme || systemTheme;

  setTheme(theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('motogp-theme')) {
      setTheme(e.matches ? 'light' : 'dark');
    }
  });
}

/**
 * Set application theme
 */
function setTheme(theme) {
  window.motoGPState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('motogp-theme', theme);

  // Update theme toggle icon
  if (elements.themeToggle) {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }
}

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  // Handle navigation clicks
  elements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');

      if (href && href !== '#') {
        const page = href.replace('.html', '').replace('#', '') || 'home';
        navigateToPage(page);
      }
    });
  });

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    const page = e.state?.page || 'home';
    navigateToPage(page, false);
  });

  // Handle scroll effects
  initScrollEffects();

  // Set active navigation based on current page
  updateActiveNavigation();
}

/**
 * Initialize scroll effects
 */
function initScrollEffects() {
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add/remove scrolled class to header
    if (elements.header) {
      if (scrollTop > 50) {
        elements.header.classList.add('scrolled');
      } else {
        elements.header.classList.remove('scrolled');
      }
    }

    lastScrollTop = scrollTop;
  });
}

/**
 * Update active navigation state
 */
function updateActiveNavigation() {
  const currentPage = window.motoGPState.currentPage;

  elements.navLinks.forEach(link => {
    link.classList.remove('active');

    const href = link.getAttribute('href');
    if (href) {
      const linkPage = href.replace('.html', '').replace('#', '') || 'home';
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    }
  });
}

/**
 * Navigate to a specific page
 */
async function navigateToPage(page, addToHistory = true) {
  if (window.motoGPState.currentPage === page) return;

  console.log(`🔄 Navigating to: ${page}`);

  try {
    showLoading();

    // Update current page
    window.motoGPState.currentPage = page;

    // Update browser history
    if (addToHistory) {
      const url = page === 'home' ? '/' : `${page}.html`;
      history.pushState({ page }, document.title, url);
    }

    // Update active navigation
    updateActiveNavigation();

    // Load page content
    await loadPageContent(page);

    // Update page title
    updatePageTitle(page);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    hideLoading();

  } catch (error) {
    console.error(`❌ Failed to navigate to ${page}:`, error);
    hideLoading();
    showError(`Failed to load ${page}. Please try again.`);
  }
}

/**
 * Load page content
 */
async function loadPageContent(page) {
  // For single-page application, this would load content dynamically
  // For this multi-page setup, we'll just initialize page-specific functionality
  const pageInitFunctions = {
    'home': initHomePage,
    'teams': initTeamsPage,
    'team-detail': initTeamDetailPage,
    'riders': initRidersPage,
    'calendar': initCalendarPage,
    'standings': initStandingsPage,
    'contact': initContactPage
  };

  const initFunction = pageInitFunctions[page];
  if (initFunction) {
    await initFunction();
  }
}

/**
 * Update page title
 */
function updatePageTitle(page) {
  const titles = {
    'home': 'MotoGP Team Portal - Official 2025 Teams & Riders',
    'teams': 'MotoGP Teams - Official 2025 Lineup',
    'team-detail': 'Team Details - MotoGP 2025',
    'riders': 'MotoGP Riders - 2025 Championship',
    'calendar': 'MotoGP Calendar - 2025 Season',
    'standings': 'MotoGP Standings - 2025 Championship',
    'contact': 'Contact - MotoGP Team Portal'
  };

  document.title = titles[page] || 'MotoGP Team Portal';
}

/**
 * Initialize search functionality
 */
function initSearch() {
  if (!elements.searchInput) return;

  let searchTimeout;

  elements.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  elements.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = elements.searchInput.value.trim();
      performSearch(query);
    }
  });
}

/**
 * Perform search
 */
function performSearch(query) {
  if (!query) {
    clearSearchResults();
    return;
  }

  console.log(`🔍 Searching for: ${query}`);

  // Search across teams and riders
  const teams = window.motoGPState.cache.teams || [];
  const riders = window.motoGPState.cache.riders || [];

  const teamResults = teams.filter(team =>
    team.name.toLowerCase().includes(query.toLowerCase()) ||
    team.manufacturer.toLowerCase().includes(query.toLowerCase())
  );

  const riderResults = riders.filter(rider =>
    rider.name.toLowerCase().includes(query.toLowerCase()) ||
    rider.nationality.toLowerCase().includes(query.toLowerCase())
  );

  displaySearchResults(teamResults, riderResults, query);
}

/**
 * Display search results
 */
function displaySearchResults(teams, riders, query) {
  const resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = '';

  if (teams.length === 0 && riders.length === 0) {
    resultsContainer.innerHTML = `
      <div class="search-no-results">
        <p>No results found for "${query}"</p>
      </div>
    `;
    return;
  }

  // Display team results
  if (teams.length > 0) {
    const teamsHtml = teams.map(team => `
      <div class="search-result-item" onclick="navigateToPage('team-detail?id=${team.id}')">
        <div class="search-result-icon">
          <img src="${team.logo}" alt="${team.name}" onerror="this.style.display='none'">
        </div>
        <div class="search-result-info">
          <div class="search-result-title">${team.name}</div>
          <div class="search-result-subtitle">${team.manufacturer}</div>
        </div>
      </div>
    `).join('');

    resultsContainer.innerHTML += `
      <div class="search-results-section">
        <h3>Teams</h3>
        ${teamsHtml}
      </div>
    `;
  }

  // Display rider results
  if (riders.length > 0) {
    const ridersHtml = riders.map(rider => `
      <div class="search-result-item" onclick="navigateToPage('rider-detail?id=${rider.id}')">
        <div class="search-result-icon">
          <span class="rider-number">${rider.number}</span>
        </div>
        <div class="search-result-info">
          <div class="search-result-title">${rider.name}</div>
          <div class="search-result-subtitle">${rider.flag} ${rider.nationality}</div>
        </div>
      </div>
    `).join('');

    resultsContainer.innerHTML += `
      <div class="search-results-section">
        <h3>Riders</h3>
        ${ridersHtml}
      </div>
    `;
  }

  resultsContainer.classList.add('active');
}

/**
 * Clear search results
 */
function clearSearchResults() {
  const resultsContainer = document.querySelector('.search-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('active');
  }
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
  if (!elements.mobileMenuToggle || !elements.mobileNav) return;

  elements.mobileMenuToggle.addEventListener('click', () => {
    const isOpen = elements.mobileNav.classList.contains('active');

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!elements.mobileNav.contains(e.target) && !elements.mobileMenuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

/**
 * Open mobile menu
 */
function openMobileMenu() {
  elements.mobileNav.classList.add('active');
  elements.mobileMenuToggle.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  elements.mobileNav.classList.remove('active');
  elements.mobileMenuToggle.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Load initial data
 */
async function loadInitialData() {
  try {
    console.log('📊 Loading initial data...');

    // Load data using cache manager
    const cacheManager = window.cacheManager || new CacheManager();
    const dataFetcher = window.dataFetcher || new DataFetcher();

    // Try to load from cache first
    let teams = await cacheManager.get('teams');
    let riders = await cacheManager.get('riders');
    let calendar = await cacheManager.get('calendar');
    let standings = await cacheManager.get('standings');

    // If cache is empty or expired, fetch fresh data
    if (!teams) {
      teams = await dataFetcher.fetchTeams();
      await cacheManager.set('teams', teams);
    }

    if (!riders) {
      riders = await dataFetcher.fetchRiders();
      await cacheManager.set('riders', riders);
    }

    if (!calendar) {
      calendar = await dataFetcher.fetchCalendar();
      await cacheManager.set('calendar', calendar);
    }

    if (!standings) {
      standings = await dataFetcher.fetchStandings();
      await cacheManager.set('standings', standings);
    }

    // Store in global state
    window.motoGPState.cache = {
      teams,
      riders,
      calendar,
      standings
    };

    console.log('✅ Initial data loaded successfully');

  } catch (error) {
    console.error('❌ Failed to load initial data:', error);
    // Load fallback data if available
    await loadFallbackData();
  }
}

/**
 * Load fallback data
 */
async function loadFallbackData() {
  try {
    const fallbackData = await fetch('/data/fallback-data.json');
    if (fallbackData.ok) {
      const data = await fallbackData.json();
      window.motoGPState.cache = data;
      console.log('✅ Fallback data loaded');
    }
  } catch (error) {
    console.error('❌ Failed to load fallback data:', error);
  }
}

/**
 * Setup auto-refresh
 */
function setupAutoRefresh() {
  if (!window.motoGPState.settings.autoRefresh) return;

  setInterval(async () => {
    if (!document.hidden) {
      console.log('🔄 Auto-refreshing data...');
      await loadInitialData();
    }
  }, window.motoGPState.settings.refreshInterval);
}

/**
 * Initialize animations
 */
function initAnimations() {
  if (!window.motoGPState.settings.animationsEnabled) return;

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.team-card, .rider-card, .fade-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Show loading overlay
 */
function showLoading() {
  window.motoGPState.isLoading = true;

  if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.add('active');
  } else {
    // Create loading overlay if it doesn't exist
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay active';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
    document.body.appendChild(overlay);
    elements.loadingOverlay = overlay;
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  window.motoGPState.isLoading = false;

  if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.remove('active');
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.innerHTML = `
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span class="error-text">${message}</span>
      <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  document.body.appendChild(errorContainer);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorContainer.parentElement) {
      errorContainer.remove();
    }
  }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successContainer = document.createElement('div');
  successContainer.className = 'success-message';
  successContainer.innerHTML = `
    <div class="success-content">
      <span class="success-icon">✅</span>
      <span class="success-text">${message}</span>
    </div>
  `;

  document.body.appendChild(successContainer);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (successContainer.parentElement) {
      successContainer.remove();
    }
  }, 3000);
}

/**
 * Format date
 */
function formatDate(dateString, format = 'short') {
  const date = new Date(dateString);

  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Format time remaining
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
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Page initialization functions (placeholders for now)
async function initHomePage() {
  console.log('🏠 Initializing home page...');
  // Home page specific initialization will be added later
}

async function initTeamsPage() {
  console.log('🏁 Initializing teams page...');
  // Teams page specific initialization will be added later
}

async function initTeamDetailPage() {
  console.log('🏆 Initializing team detail page...');
  // Team detail page specific initialization will be added later
}

async function initRidersPage() {
  console.log('👨‍🦰 Initializing riders page...');
  // Riders page specific initialization will be added later
}

async function initCalendarPage() {
  console.log('📅 Initializing calendar page...');
  // Calendar page specific initialization will be added later
}

async function initStandingsPage() {
  console.log('🏆 Initializing standings page...');
  // Standings page specific initialization will be added later
}

async function initContactPage() {
  console.log('📧 Initializing contact page...');
  // Contact page specific initialization will be added later
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export functions for global access
window.motoGPApp = {
  navigateToPage,
  performSearch,
  clearSearchResults,
  setTheme,
  showLoading,
  hideLoading,
  showError,
  showSuccess,
  formatDate,
  formatTimeRemaining,
  debounce,
  throttle
};