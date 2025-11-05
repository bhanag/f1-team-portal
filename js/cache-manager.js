/**
 * MotoGP Team Portal - Cache Manager
 * Handles LocalStorage caching, expiration, and offline functionality
 */

class CacheManager {
  constructor() {
    this.storageKey = 'motogp_portal_cache';
    this.defaultTTL = {
      teams: 24 * 60 * 60 * 1000,        // 24 hours
      riders: 24 * 60 * 60 * 1000,       // 24 hours
      calendar: 6 * 60 * 60 * 1000,      // 6 hours
      standings: 30 * 60 * 1000,         // 30 minutes
      images: 7 * 24 * 60 * 60 * 1000    // 7 days
    };

    this.version = '2025.1.0';
    this.maxStorageSize = 5 * 1024 * 1024; // 5MB
    this.compressionEnabled = true;

    this.initializeCache();
  }

  /**
   * Initialize cache system
   */
  initializeCache() {
    try {
      // Check if localStorage is available
      if (!this.isStorageAvailable()) {
        console.warn('⚠️ localStorage not available, cache disabled');
        return;
      }

      // Load existing cache
      this.cache = this.loadCache();
      this.cleanupExpiredEntries();
      this.checkStorageQuota();

      console.log('💾 Cache manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize cache:', error);
      this.cache = { data: {}, metadata: {} };
    }
  }

  /**
   * Check if localStorage is available
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load cache from localStorage
   */
  loadCache() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return { data: {}, metadata: {} };
      }

      const cache = JSON.parse(stored);

      // Check version compatibility
      if (cache.version !== this.version) {
        console.log('🔄 Cache version mismatch, clearing cache');
        this.clearCache();
        return { data: {}, metadata: {} };
      }

      return {
        data: cache.data || {},
        metadata: cache.metadata || {}
      };

    } catch (error) {
      console.error('❌ Failed to load cache:', error);
      return { data: {}, metadata: {} };
    }
  }

  /**
   * Save cache to localStorage
   */
  saveCache() {
    try {
      const cacheToSave = {
        version: this.version,
        data: this.cache.data,
        metadata: this.cache.metadata,
        lastUpdated: new Date().toISOString()
      };

      const serialized = JSON.stringify(cacheToSave);

      // Check storage quota before saving
      if (serialized.length > this.maxStorageSize) {
        console.warn('⚠️ Cache exceeds storage limit, performing cleanup');
        this.performAggressiveCleanup();
        return this.saveCache();
      }

      localStorage.setItem(this.storageKey, serialized);
      return true;

    } catch (error) {
      console.error('❌ Failed to save cache:', error);

      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ Storage quota exceeded, clearing old entries');
        this.performAggressiveCleanup();
        return this.saveCache();
      }

      return false;
    }
  }

  /**
   * Get data from cache
   */
  async get(key) {
    try {
      // Check if data exists in cache
      if (!this.cache.data[key]) {
        return null;
      }

      const cachedItem = this.cache.data[key];
      const metadata = this.cache.metadata[key];

      // Check if data has expired
      if (this.isExpired(metadata)) {
        console.log(`⏰ Cache expired for ${key}`);
        this.delete(key);
        return null;
      }

      console.log(`✅ Cache hit for ${key}`);
      return cachedItem;

    } catch (error) {
      console.error(`❌ Failed to get cached data for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set(key, data, customTTL = null) {
    try {
      const ttl = customTTL || this.defaultTTL[key] || 24 * 60 * 60 * 1000;
      const expiresAt = Date.now() + ttl;

      // Compress data if enabled and it's large
      let dataToStore = data;
      if (this.compressionEnabled && this.shouldCompress(data)) {
        dataToStore = this.compressData(data);
      }

      this.cache.data[key] = dataToStore;
      this.cache.metadata[key] = {
        expiresAt,
        size: this.getDataSize(dataToStore),
        compressed: this.compressionEnabled && this.shouldCompress(data),
        createdAt: Date.now(),
        accessedAt: Date.now(),
        accessCount: 0
      };

      const saved = this.saveCache();
      if (saved) {
        console.log(`💾 Cached ${key} (${this.formatBytes(this.cache.metadata[key].size)})`);
      }

      return saved;

    } catch (error) {
      console.error(`❌ Failed to cache data for ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete specific cache entry
   */
  delete(key) {
    try {
      delete this.cache.data[key];
      delete this.cache.metadata[key];
      this.saveCache();
      console.log(`🗑️ Deleted cache entry: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete cache entry ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    try {
      this.cache = { data: {}, metadata: {} };
      localStorage.removeItem(this.storageKey);
      console.log('🗑️ Cache cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(metadata) {
    if (!metadata || !metadata.expiresAt) {
      return true;
    }
    return Date.now() > metadata.expiresAt;
  }

  /**
   * Cleanup expired entries
   */
  cleanupExpiredEntries() {
    let cleanedCount = 0;
    const now = Date.now();

    for (const key in this.cache.metadata) {
      if (this.isExpired(this.cache.metadata[key])) {
        delete this.cache.data[key];
        delete this.cache.metadata[key];
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.saveCache();
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Check storage quota usage
   */
  checkStorageQuota() {
    try {
      const used = this.getCurrentCacheSize();
      const available = this.maxStorageSize;
      const usage = (used / available) * 100;

      console.log(`📊 Cache usage: ${this.formatBytes(used)} / ${this.formatBytes(available)} (${usage.toFixed(1)}%)`);

      if (usage > 80) {
        console.warn('⚠️ Cache usage high, performing cleanup');
        this.performCleanup();
      }

      return { used, available, usage };
    } catch (error) {
      console.error('❌ Failed to check storage quota:', error);
      return null;
    }
  }

  /**
   * Get current cache size
   */
  getCurrentCacheSize() {
    try {
      const serialized = JSON.stringify(this.cache);
      return new Blob([serialized]).size;
    } catch (error) {
      console.error('❌ Failed to calculate cache size:', error);
      return 0;
    }
  }

  /**
   * Perform aggressive cleanup (LRU)
   */
  performAggressiveCleanup() {
    console.log('🧹 Performing aggressive cache cleanup...');

    // Sort entries by last access time (oldest first)
    const entries = Object.entries(this.cache.metadata)
      .sort(([, a], [, b]) => (a.accessedAt || 0) - (b.accessedAt || 0));

    // Remove oldest 50% of entries
    const toRemove = Math.ceil(entries.length * 0.5);
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      delete this.cache.data[key];
      delete this.cache.metadata[key];
    }

    this.saveCache();
    console.log(`🗑️ Removed ${toRemove} cache entries (aggressive cleanup)`);
  }

  /**
   * Perform regular cleanup (remove expired and large entries)
   */
  performCleanup() {
    console.log('🧹 Performing cache cleanup...');

    let removedCount = 0;
    const now = Date.now();
    const sizeThreshold = 1024 * 1024; // 1MB

    // Remove expired entries
    for (const key in this.cache.metadata) {
      const metadata = this.cache.metadata[key];
      if (this.isExpired(metadata) || metadata.size > sizeThreshold) {
        delete this.cache.data[key];
        delete this.cache.metadata[key];
        removedCount++;
      }
    }

    // If still too large, remove oldest entries
    if (this.getCurrentCacheSize() > this.maxStorageSize * 0.7) {
      const entries = Object.entries(this.cache.metadata)
        .sort(([, a], [, b]) => (a.accessedAt || 0) - (b.accessedAt || 0));

      const toRemove = Math.ceil(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        const [key] = entries[i];
        delete this.cache.data[key];
        delete this.cache.metadata[key];
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.saveCache();
      console.log(`🗑️ Removed ${removedCount} cache entries (cleanup)`);
    }
  }

  /**
   * Check if data should be compressed
   */
  shouldCompress(data) {
    try {
      const serialized = JSON.stringify(data);
      return serialized.length > 1024; // Compress if larger than 1KB
    } catch (error) {
      return false;
    }
  }

  /**
   * Compress data (simple compression - in production use proper compression)
   */
  compressData(data) {
    try {
      const serialized = JSON.stringify(data);
      // This is a placeholder for proper compression
      // In a real implementation, you'd use compression libraries like pako or lz-string
      return {
        _compressed: true,
        _originalSize: serialized.length,
        data: serialized // In reality, this would be compressed
      };
    } catch (error) {
      console.error('❌ Failed to compress data:', error);
      return data;
    }
  }

  /**
   * Decompress data
   */
  decompressData(compressedData) {
    try {
      if (compressedData._compressed) {
        // In reality, you'd decompress here
        return JSON.parse(compressedData.data);
      }
      return compressedData;
    } catch (error) {
      console.error('❌ Failed to decompress data:', error);
      return compressedData;
    }
  }

  /**
   * Get data size
   */
  getDataSize(data) {
    try {
      const serialized = JSON.stringify(data);
      return new Blob([serialized]).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get cache statistics
   */
  getStats() {
    try {
      const stats = {
        totalEntries: Object.keys(this.cache.data).length,
        totalSize: this.getCurrentCacheSize(),
        maxSize: this.maxStorageSize,
        usagePercentage: ((this.getCurrentCacheSize() / this.maxStorageSize) * 100).toFixed(2),
        entries: {}
      };

      for (const key in this.cache.metadata) {
        const metadata = this.cache.metadata[key];
        stats.entries[key] = {
          size: metadata.size,
          expiresAt: new Date(metadata.expiresAt).toISOString(),
          isExpired: this.isExpired(metadata),
          accessCount: metadata.accessCount || 0,
          lastAccessed: metadata.accessedAt ? new Date(metadata.accessedAt).toISOString() : 'Never'
        };
      }

      return stats;
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Update access metadata
   */
  updateAccess(key) {
    if (this.cache.metadata[key]) {
      this.cache.metadata[key].accessedAt = Date.now();
      this.cache.metadata[key].accessCount = (this.cache.metadata[key].accessCount || 0) + 1;
    }
  }

  /**
   * Export cache for backup
   */
  exportCache() {
    try {
      const exportData = {
        version: this.version,
        exportDate: new Date().toISOString(),
        cache: this.cache,
        stats: this.getStats()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `motogp-cache-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('📤 Cache exported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to export cache:', error);
      return false;
    }
  }

  /**
   * Import cache from backup
   */
  async importCache(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data
      if (!importData.version || !importData.cache) {
        throw new Error('Invalid cache backup format');
      }

      // Check version compatibility
      if (importData.version !== this.version) {
        console.warn('⚠️ Cache backup version differs, proceeding anyway');
      }

      // Import data
      this.cache = importData.cache;
      this.saveCache();

      console.log('📥 Cache imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import cache:', error);
      return false;
    }
  }

  /**
   * Check if application is online
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Setup offline detection
   */
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      console.log('🌐 Application is online');
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Application is offline');
      this.showOfflineMessage();
    });
  }

  /**
   * Sync data when coming back online
   */
  async syncWhenOnline() {
    console.log('🔄 Syncing data after coming back online...');

    // This would trigger data refresh for expired entries
    // Implementation depends on the specific requirements
  }

  /**
   * Show offline message
   */
  showOfflineMessage() {
    if (window.motoGPApp && window.motoGPApp.showSuccess) {
      window.motoGPApp.showSuccess('You\'re currently offline. Showing cached data.');
    }
  }
}

// Export for global use
window.CacheManager = CacheManager;