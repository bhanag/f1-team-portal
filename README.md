# MotoGP Team Portal

A comprehensive, responsive web application showcasing all official MotoGP teams, riders, calendar, and championship standings for the 2025 season. Built with vanilla HTML5, CSS3, and JavaScript ES6.

## 🏁 Overview

The MotoGP Team Portal is a modern, dark-themed racing-inspired web application that provides real-time information about the MotoGP World Championship. It features dynamic data fetching from official sources, comprehensive team and rider profiles, an interactive race calendar, and live championship standings.

### Key Features

- **Real-time Data**: Automatically fetches from official MotoGP sources with fallback to cached data
- **Responsive Design**: Mobile-first approach with breakpoints for desktop, tablet, and mobile
- **Team Profiles**: Detailed information for all 12 official 2025 teams with rider rosters and statistics
- **Race Calendar**: Interactive calendar with countdown timers and race results
- **Championship Standings**: Live standings for riders, teams, and manufacturers
- **Search & Filter**: Powerful search and filtering capabilities
- **Offline Support**: Full functionality even without internet connection using cached data
- **Modern UI**: Dark theme with MotoGP red accents and smooth animations

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (no frameworks)
- **Data Fetching**: Fetch API with CORS proxy handling
- **Caching**: LocalStorage with intelligent expiration policies
- **Design**: CSS Grid, Flexbox, animations, transitions
- **Responsiveness**: Mobile-first media queries

## 📁 Project Structure

```
/workspace/cmhlv90du005kpsilncknk8ba/f1-team-portal/
├── index.html              # Main landing page
├── teams.html              # Teams grid page
├── team-detail.html          # Individual team detail page
├── riders.html             # Riders list page
├── calendar.html           # Race calendar page
├── standings.html          # Championship tables
├── contact.html            # Contact page
├── /css/
│    ├── styles.css         # Core styles and variables
│    ├── components.css     # Reusable components
│    └── responsive.css     # Media queries
├── /js/
│    ├── main.js           # Core application logic
│    ├── data-fetcher.js   # API and data fetching
│    ├── cache-manager.js  # LocalStorage management
│    ├── teams.js          # Teams page functionality
│    ├── riders.js         # Riders page functionality
│    ├── calendar.js       # Calendar functionality
│    ├── standings.js      # Standings functionality
│    └── cache-manager.js  # LocalStorage management
│── /data/
│    ├── teams-fallback.json     # Offline teams data
│    ├── riders-fallback.json    # Offline riders data
│    ├── calendar-fallback.json  # Offline calendar data
│    └── standings-fallback.json # Offline standings data
│── /images/
│    ├── logos/             # Team and MotoGP logos
│    ├── heroes/            # Team hero images
│    ├── riders/            # Rider headshots
│    └── fallback/          # Fallback images
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Local web server (like Python's http.server, Node.js, or Live Server)
- Text editor or IDE

### Installation

1. **Clone or Download**:
   ```bash
   git clone https://github.com/your-username/motogp-team-portal.git
   cd motogp-team-portal
   ```

2. **Start Local Server**:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve

   # Live Server (VS Code extension)
   # Install Live Server extension
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:8000`

### Development Setup

The application is ready to use immediately with fallback data. To enable live data fetching:

1. **Configure CORS Proxy**:
   The application includes a CORS proxy for development. For production, set up a proper server-side proxy.

2. **Update API Endpoints**:
   Modify `js/data-fetcher.js` to use official data sources.

3. **Configure Caching**:
   Adjust cache expiration times in `js/cache-manager.js` based on your needs.

## 📱� Data Sources

The portal attempts to fetch from official MotoGP sources:

- **Teams**: https://www.motogp.com/en/teams/motogp
- **Riders**: https://www.motogp.com/en/riders/motogp
- **Calendar**: https://www.motogp.com/en/calendar
- **Standings**: https://www.motogp.com/en/world-standing/2025/motogp/championship-standings

**Data Structure**:
- Team information, logos, colors, base location, team principal
- Rider profiles, photos, statistics, championship history
- Race calendar with dates, circuits, locations
- Championship standings with points, positions, gaps
- Bike specifications and technical details

## 🎨 Features

### Teams Section
- **Grid/List Views**: Switch between grid and list layouts
- **Manufacturer Filtering**: Filter teams by Ducati, Yamaha, Honda, KTM, Aprilia
- **Team Details**: Comprehensive profiles with rider rosters
- **Search**: Real-time search across teams and riders
- **Hover Effects**: Team brand colors and interactive elements

### Riders Section
- **Rider Profiles**: Complete career statistics and information
- **Team Association**: Links to team pages
- **Career Stats**: Wins, podiums, pole positions, championships
- **Filtering**: By team, nationality, or statistics
- **View Toggle**: Grid and list views for different preferences

### Calendar Section
- **Calendar Grid**: Traditional monthly calendar with race markers
- **List View**: Detailed race information
- **Countdown Timers**: Live countdown to next race
- **Race Status**: Visual indicators (completed, upcoming, in-progress)
- **Filtering**: By status, continent, or search
- **Interactive**: Click for detailed race information

### Standings Section
- **Rider Championship**: Complete rider standings with points
- **Team Championship**: Team championship table with aggregated points
- **Manufacturer Standings**: Constructor championship standings
- **Sorting**: Sortable columns (position, points, wins, etc.)
- **Search**: Filter by rider or team name
- **Live Updates**: Real-time standings during race weekends

## 🎨 Design System

### Color Palette
- **Primary Background**: #0E0E0E (dark black)
- **Secondary Background**: #1A1A1A (dark gray)
- **Accent Red**: #FF1E00 (MotoGP red)
- **Text White**: #FFFFFF (primary text)
- **Text Gray**: #CCCCCC (secondary text)
- **Border Gray**: #333333 (subtle borders)

### Typography
- **Headings**: Orbitron, Roboto Condensed (racing/tech feel)
- **Body**: Poppins (clean, modern)
- **Font Sizes**: 48px (H1), 36px (H2), 28px (H3), 16px (body), 12px (small)

### Interactive Elements
- **Border Radius**: 10-16px (cards), 6px (buttons), 50% (circular)
- **Shadows**: Subtle box-shadows, glow effects on hover
- **Transitions**: 0.3s ease-in-out for all interactions
- **Hover Effects**: Transform translateY(-4px), glow with team colors

### Team Brand Colors
- **Ducati**: #DC143C
- **Yamaha**: #0066CC
- **Honda**: #FF8C00
- **KTM**: #FF6600
- **Aprilia**: #4A90E2
- **LCR**: #FFD700
- **Gresini**: #8B0000
- **VR46**: #FFD700
- **Pramac**: #003366
- **Tech3**: #003300
- **Trackhouse**: #000000
- **RNF**: #004080

## 📱 Responsive Design

### Breakpoints
- **Mobile**: ≤767px
- **Tablet**: 768-1023px
- **Desktop**: ≥1024px

### Layout Adaptations
- **Mobile**: Single column layouts, touch-friendly interfaces
- **Tablet**: 2-3 column grids, optimized spacing
- **Desktop**: Full feature layouts with all data visible

### Mobile Optimizations
- Touch-friendly button sizes (44px minimum)
- Simplified stats displays
- Horizontal scrolling for data tables
- Collapsible navigation drawer
- Reduced animation complexity on low-end devices

## 🔧 Functionality

### Data Fetching
- **Primary Sources**: Official MotoGP.com websites
- **CORS Handling**: Development proxy with fallback mechanisms
- **Retry Logic**: Exponential backoff with 3 attempts
- **Error Handling**: Graceful degradation to cached data
- **Parsing**: HTML content parsing and data extraction

### Caching Strategy
- **LocalStorage**: Persistent data caching with expiration
- **Cache Types**: Teams (24h), Riders (24h), Calendar (6h), Standings (30min)
- **Compression**: Data compression for large datasets
- **Cleanup**: Automatic expired entry removal
- **Quota Management**: Storage quota monitoring

### Search & Filtering
- **Real-time**: Debounced search with live results
- **Multi-field**: Search across names, teams, and details
- **Filters**: Manufacturer, nationality, status, date ranges
- **Sorting**: Multiple sort options across all data types
- **Results**: Instant feedback with result counts

### Performance
- **Lazy Loading**: Images loaded on scroll
- **Virtual Scrolling**: For large data sets
- **Debouncing**: Prevents excessive API calls
- **Optimized Selectors**: Efficient DOM queries
- **Animation Control**: Reduced motion support

## 📊 Content Structure

### Pages

1. **Home** (`index.html`)
   - Hero section with animated content
   - Featured teams preview
   - Quick statistics
   - Live race countdown
   - Recent race results snippet

2. **Teams** (`teams.html`)
   - 4x3 responsive team grid
   - Manufacturer filtering
   - Search functionality
   - Team detail navigation

3. **Team Detail** (`team-detail.html`)
   - Hero section with team branding
   - Team information and statistics
   - Riders section with detailed cards
   - Bike specifications section
   - Related teams section

4. **Riders** (`riders.html`)
   - Comprehensive rider listings
   - Career statistics and history
   - Team association
   - Advanced filtering options
   - Rider comparison tool

5. **Calendar** (`calendar.html`)
   - Interactive calendar grid
   - List view with detailed race information
   - Race weekend schedule expansion
   - Race results archive
   - Season statistics overview

6. **Standings** (`standings.html`)
   - Rider championship table
   - Team championship table
   - Constructor standings
   - Historical comparison
   - Progress charts
   - Export to PDF/CSV

7. **Contact** (`contact.html`)
   - Contact form with validation
   - FAQ section
   - Quick links and resources
   - Social media integration

## 🔧 Configuration

### Environment Variables
The application uses CSS custom properties for easy customization:

```css
:root {
  --primary-bg: #0E0E0E;
  --accent-red: #FF1E00;
  --text-primary: #FFFFFF;
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.3s ease-in-out;
}
```

### Data Fetching Configuration
```javascript
// In js/data-fetcher.js
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const DATA_SOURCES = {
  teams: 'https://www.motogp.com/en/teams/motogp',
  riders: 'https://www.motogp.com/en/riders/motogp',
  // ... other sources
};
```

### Cache Configuration
```javascript
// In js/cache-manager.js
const CACHE_TTL = {
  teams: 24 * 60 * 60 * 1000,      // 24 hours
  riders: 24 * 60 * 60 * 1000,     // 24 hours
  calendar: 6 * 60 * 60 * 1000,      // 6 hours
  standings: 30 * 60 * 1000             // 30 minutes
};
```

## 🚀 Performance Features

### Loading Optimization
- **Skeleton Loading**: Visual placeholders while data loads
- **Progressive Enhancement**: Start with fallback, enhance with live data
- **Intersection Observer**: Lazy load animations
- **Request Animation**: Smooth loading states

### Memory Management
- **Data Compression**: Efficient storage usage
- **Automatic Cleanup**: Remove expired cache entries
- **Storage Monitoring**: Prevent quota exceeded errors
- **Efficient DOM Updates**: Minimize reflows

### Animation Performance
- **CSS Transforms**: Hardware-accelerated animations
- **Will-Change**: Optimize element animations
- **Reduced Motion**: Respects user preferences
- **60fps Targets**: Smooth 60fps animations

## 🔒 Browser Support

### Compatible Browsers
- **Chrome/Edge 90+**: Full feature support
- **Firefox 88+**: Full feature support
- **Safari 14+**: Full feature support
- **iOS Safari 14+**: Mobile optimized
- **Android Chrome 90+**: Mobile optimized

### Polyfills & Fallbacks
- **Intersection Observer**: For older browsers
- **CSS Grid**: Flexbox fallback where needed
- **Fetch API**: XMLHttpRequest fallback
- **CSS Custom Properties**: Color fallback colors
- **Smooth Scroll**: Browser-native fallback

## 🔧 Data Integration

### Official Data Sources
- **Teams**: https://www.motogp.com/en/teams/motogp
- **Riders**: https://www.motogp.com/en/riders/motogp
- **Calendar**: https://www.motogp.com/en/calendar
- **Standings**: https://www.motogp.com/en/world-standing/2025/motogp/championship-standings

### Data Structure Example
```javascript
{
  "team": {
    "id": "ducati-lenovo",
    "name": "Ducati Lenovo Team",
    "manufacturer": "Ducati",
    "base": "Bologna, Italy",
    "team_principal": "Davide Tardozzi",
    "riders": ["francesco-bagnaia", "marc-marquez"],
    "stats": {
      "championship_position": 1,
      "points": 156,
      "wins": 3,
      "podiums": 5,
      "gap_to_leader": "0"
    }
  }
}
```

### Fetching Strategy
1. **Cache Check**: Check LocalStorage for fresh data
2. **API Attempt**: Try official sources with proxy
3. **HTML Parsing**: Parse response using DOMParser
4. **Data Extraction**: Extract data with CSS selectors
5. **Cache Update**: Store fresh data with timestamp
6. **Fallback Data**: Use cached data if network fails
7. **Offline Mode**: Use static JSON fallback

### Error Handling
```javascript
try {
  const data = await fetchWithRetry(url);
  const parsed = parseData(data);
  return parsed;
} catch (error) {
  console.warn('API fetch failed, using cache:', error.message);
  return getFromCache();
}
```

## 🎨 Customization

### Colors and Branding
```css
:root {
  --ducati-red: #DC143C;
  --yamaha-blue: #0066CC;
  --honda-orange: #FF8C00;
  --ktm-orange: #FF6600;
  --aprilia-blue: #4A90E2;
}
```

### Typography
```css
:root {
  --font-heading: 'Orbitron', 'Roboto Condensed', sans-serif;
  --font-body: 'Poppins', sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
}
```

### Animations
```css
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.slide-up {
  animation: slideUp 0.6s ease-out;
  transform-origin: bottom;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🔍 Functionality

### Data Fetching
- **Primary Sources**: Official MotoGP.com websites
- **CORS Handling**: Development proxy with fallback mechanisms
- **Retry Logic**: Exponential backoff with 3 attempts
- **Error Handling**: Graceful degradation to cached data
- **Parsing**: HTML content using DOMParser
- **Data Extraction**: Extract data with CSS selectors
- **Cache Update**: Store fresh data with timestamp
- **Fallback Data**: Use cached data if network fails

### Caching Strategy
- **LocalStorage**: Persistent data caching with expiration
- **Cache Types**: Teams (24h), Riders (24h), Calendar (6h), Standings (30min)
- **Compression**: Data compression for large datasets
- **Cleanup**: Automatic expired entry removal
- **Quota Management**: Storage quota monitoring
- **Error Recovery**: Fallback strategies for failed requests

### Search & Filtering
- **Real-time**: Debounced search with live results
- **Multi-field**: Search across names, teams, and details
- **Filters**: Manufacturer, nationality, status, date ranges
- **Sorting**: Multiple sort options across all data types
- **Results**: Instant feedback with result counts

### Performance
- **Lazy Loading**: Images loaded on scroll
- **Virtual Scrolling**: For large data sets
- **Debouncing**: Prevents excessive API calls
- **Optimized Selectors**: Efficient DOM queries
- **Animation Control**: Reduced motion support

## 📱 Content Structure

### Pages

1. **Home** (`index.html`)
   - Hero section with animated content
   - Featured teams preview
   - Quick statistics
   - Live race countdown
   - Recent race results snippet

2. **Teams** (`teams.html`)
   - 4x3 responsive team grid
   - Manufacturer filtering
   - Search functionality
   - Team detail navigation

3. **Team Detail** (`team-detail.html`)
   - Hero section with team branding
   - Team information and statistics
   - Riders section with detailed cards
   - Bike specifications section
   - Related teams section

4. **Riders** (`riders.html`)
   - Comprehensive rider listings
   - Career statistics and history
   - Team association
   - Advanced filtering options
   - Rider comparison tool

5. **Calendar** (`calendar.html`)
   - Interactive calendar grid
   - List view with detailed race information
   - Race weekend schedule expansion
   - Race results archive
   - Season statistics overview

6. **Standings** (`standings.html`)
   - Rider championship table
   - Team championship table
   - Constructor standings
   - Historical comparison
   - Progress charts
   - Export functionality

7. **Contact** (`contact.html`)
   - Contact form with validation
   - FAQ section
   - Quick links and resources
   - Social media integration

## 🔧 Configuration

### Environment Variables
The application uses CSS custom properties for easy customization:

```css
:root {
  --primary-bg: #0E0E0E;
  --accent-red: #FF1E00;
  --text-primary: #FFFFFF;
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.3s ease-in-out;
}
```

### Data Fetching Configuration
```javascript
// In js/data-fetcher.js
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const DATA_SOURCES = {
  teams: 'https://www.motogp.com/en/teams/motogp',
  riders: 'https://www.motogp.com/en/riders/motogp',
  // ... other sources
};
```

### Cache Configuration
```javascript
// In js/cache-manager.js
const CACHE_TTL = {
  teams: 24 * 60 * 60 * 1000,      // 24 hours
  riders: 24 * 60 * 60 * 1000,     // 24 hours
  calendar: 6 * 60 * 60 * 1000,      // 6 hours
  standings: 30 * 60 * 1000             // 30 minutes
};
```

## 🚀 Performance Features

### Loading Optimization
- **Skeleton Loading**: Visual placeholders while data loads
- **Progressive Enhancement**: Start with fallback, enhance with live data
- **Intersection Observer**: Lazy load animations
- **Request Animation**: Smooth loading states

### Memory Management
- **Data Compression**: Efficient storage usage
- **Automatic Cleanup**: Remove expired cache entries
- **Storage Monitoring**: Prevent quota exceeded errors
- **Efficient DOM Updates**: Minimize reflows

### Animation Performance
- **CSS Transforms**: Hardware-accelerated animations
- **Will-Change**: Optimize element animations
- **Reduced Motion**: Respects user preferences
- **60fps Targets**: Smooth 60fps animations

## 🔒 Browser Support

### Compatible Browsers
- **Chrome/Edge 90+**: Full feature support
- **Firefox 88+**: Full feature support
- **Safari 14+**: Full feature support
- **iOS Safari 14+**: Mobile optimized
- **Android Chrome 90+**: Mobile optimized

### Polyfills & Fallbacks
- **Intersection Observer**: For older browsers
- **CSS Grid**: Flexbox fallback where needed
- **Fetch API**: XMLHttpRequest fallback
- **CSS Custom Properties**: Color fallback colors
- **Smooth Scroll**: Browser-native fallback

## 📄 Documentation

### Project Documentation
- Inline code comments for complex logic
- Function documentation with JSDoc
- Component documentation with examples
- Setup instructions and guides

### API Documentation
- Data fetching methods and parameters
- Cache management functions
- Error handling procedures
- Custom component usage

## 🔒 Maintenance

### Regular Updates
- **Data Refresh**: Update fallback data as season progresses
- **Browser Testing**: Test with new browser versions
- **Performance**: Monitor loading times and optimization
- **Security**: Keep dependencies updated

### Season Updates
- **Pre-Season**: Update teams, riders, calendar
- **During Season**: Update standings, results
- **Post-Season**: Archive data for next season
- **Off-Season**: Prepare for new season

### Technical Debt
- **Code Review**: Regular code quality checks
- **Refactoring**: Improve maintainability
- **Testing**: Add missing test coverage
- **Documentation**: Keep docs updated

---

**© 2025 MotoGP Team Portal | Educational Use Only | Data © MotoGP.com**