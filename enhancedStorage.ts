// Enhanced storage with multiple fallbacks for better persistence
export interface CookieStorageInterface {
  setItem(key: string, value: string): boolean;
  getItem(key: string): string | null;
  removeItem(key: string): boolean;
}

export const CookieStorage: CookieStorageInterface = {
  setItem: function(key: string, value: string): boolean {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      document.cookie = key + '=' + encodeURIComponent(value) + ';expires=' + expires.toUTCString() + ';path=/';
      return true;
    } catch (error) {
      console.error('Cookie set failed:', error);
      return false;
    }
  },

  getItem: function(key: string): string | null {
    try {
      const nameEQ = key + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    } catch (error) {
      console.error('Cookie get failed:', error);
      return null;
    }
  },

  removeItem: function(key: string): boolean {
    try {
      document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      return true;
    } catch (error) {
      console.error('Cookie remove failed:', error);
      return false;
    }
  }
};

export interface EnhancedStorageInterface {
  setItem(key: string, value: string): boolean;
  getItem(key: string): string | null;
  removeItem(key: string): boolean;
}

export const EnhancedStorage: EnhancedStorageInterface = {
  setItem: function(key: string, value: string): boolean {
    // Try localStorage first
    try {
      localStorage.setItem(key, value);
      console.log(`✅ localStorage save successful: ${key}`);
      return true;
    } catch (e) {
      console.warn(`❌ localStorage failed for ${key}:`, e);
      
      // Try sessionStorage as backup
      try {
        sessionStorage.setItem(key, value);
        console.log(`✅ sessionStorage backup successful: ${key}`);
        return true;
      } catch (e2) {
        console.warn(`❌ sessionStorage failed for ${key}:`, e2);
        
        // Try cookies as final fallback
        const cookieSuccess = CookieStorage.setItem(key, value);
        if (cookieSuccess) {
          console.log(`✅ Cookie backup successful: ${key}`);
          return true;
        } else {
          console.error(`❌ All storage methods failed for ${key}`);
          return false;
        }
      }
    }
  },

  getItem: function(key: string): string | null {
    // Try localStorage first
    try {
      const localStorageValue = localStorage.getItem(key);
      if (localStorageValue !== null) {
        console.log(`✅ localStorage read successful: ${key}`);
        return localStorageValue;
      }
    } catch (e) {
      console.warn(`❌ localStorage read failed for ${key}:`, e);
    }
    
    // Try sessionStorage as backup
    try {
      const sessionStorageValue = sessionStorage.getItem(key);
      if (sessionStorageValue !== null) {
        console.log(`✅ sessionStorage read successful: ${key}`);
        return sessionStorageValue;
      }
    } catch (e2) {
      console.warn(`❌ sessionStorage read failed for ${key}:`, e2);
    }
    
    // Try cookies as final fallback
    const cookieValue = CookieStorage.getItem(key);
    if (cookieValue !== null) {
      console.log(`✅ Cookie read successful: ${key}`);
      return cookieValue;
    }
    
    console.log(`ℹ️ No data found for ${key} in any storage`);
    return null;
  },

  removeItem: function(key: string): boolean {
    let success = false;
    
    // Remove from all storage locations
    try {
      localStorage.removeItem(key);
      success = true;
      console.log(`✅ Removed from localStorage: ${key}`);
    } catch (e) {
      console.warn(`❌ Failed to remove from localStorage: ${key}`, e);
    }
    
    try {
      sessionStorage.removeItem(key);
      success = true;
      console.log(`✅ Removed from sessionStorage: ${key}`);
    } catch (e) {
      console.warn(`❌ Failed to remove from sessionStorage: ${key}`, e);
    }
    
    try {
      CookieStorage.removeItem(key);
      success = true;
      console.log(`✅ Removed from cookies: ${key}`);
    } catch (e) {
      console.warn(`❌ Failed to remove from cookies: ${key}`, e);
    }
    
    return success;
  }
};

export default EnhancedStorage;