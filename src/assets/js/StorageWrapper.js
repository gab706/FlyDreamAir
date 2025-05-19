class StorageWrapper {
    /**
     * Checks if the given storage type (local/session) is available and writable.
     */
    static _canUse(type) {
        try {
            const s = window[`${type}Storage`];
            s.setItem('__t', '__t');
            s.removeItem('__t');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Checks if cookies are enabled and usable.
     */
    static _cookiesOn() {
        try {
            document.cookie = 'test=1; path=/';
            const ok = document.cookie.includes('test=');
            // Remove test cookie
            document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
            return ok;
        } catch {
            return false;
        }
    }

    /**
     * Stores a key-value pair in localStorage, sessionStorage, or cookies (fallback).
     * @param {string} key - The key to store the value under.
     * @param {*} val - The value to store (will be JSON-stringified).
     * @param {string} type - 'local' | 'session' | fallback to cookies if unavailable.
     * @param {object} opts - Optional settings (e.g., cookie expiry in days).
     */
    static set(key, val, type = 'local', opts = {}) {
        const str = JSON.stringify(val);
        if (type === 'local' && this._canUse('local')) localStorage.setItem(key, str);
        else if (type === 'session' && this._canUse('session')) sessionStorage.setItem(key, str);
        else if (this._cookiesOn()) this._setCookie(key, str, opts.days ?? 7);
    }

    /**
     * Retrieves a value by key from localStorage, sessionStorage, or cookies.
     * Automatically parses JSON if possible.
     */
    static get(key, type = 'local') {
        let val = null;
        if (type === 'local' && this._canUse('local')) val = localStorage.getItem(key);
        else if (type === 'session' && this._canUse('session')) val = sessionStorage.getItem(key);
        else if (this._cookiesOn()) val = this._getCookie(key);

        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    }

    /**
     * Removes a value by key from the specified storage or cookies.
     */
    static remove(key, type = 'local') {
        if (type === 'local' && this._canUse('local')) localStorage.removeItem(key);
        else if (type === 'session' && this._canUse('session')) sessionStorage.removeItem(key);
        if (this._cookiesOn()) this._removeCookie(key);
    }

    /**
     * Clears all localStorage, sessionStorage, and cookies (if available).
     */
    static clearAll() {
        if (this._canUse('local')) localStorage.clear();
        if (this._canUse('session')) sessionStorage.clear();
        if (this._cookiesOn()) this._clearCookies();
    }

    /**
     * Sets a cookie with an optional expiry in days.
     */
    static _setCookie(k, v, d) {
        const exp = new Date(Date.now() + d * 864e5).toUTCString(); // d days from now
        document.cookie = `${encodeURIComponent(k)}=${encodeURIComponent(v)}; expires=${exp}; path=/`;
    }

    /**
     * Gets a cookie value by key.
     */
    static _getCookie(k) {
        return document.cookie
            .split('; ')
            .map(c => c.split('='))
            .find(([key]) => decodeURIComponent(key) === k)?.[1] ?? null;
    }

    /**
     * Deletes a cookie by key.
     */
    static _removeCookie(k) {
        document.cookie = `${encodeURIComponent(k)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }

    /**
     * Clears all cookies available on the current path/domain.
     */
    static _clearCookies() {
        document.cookie
            .split('; ')
            .forEach(c => this._removeCookie(c.split('=')[0]));
    }
}

// DO NOT REMOVE -- REQUIRED FOR JEST TESTS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageWrapper;
}