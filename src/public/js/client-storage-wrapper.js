class ClientStorageWrapper {
    static _dbName = 'FlyDreamAirStorage';
    static _storeName = 'store';

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

    static _cookiesOn() {
        try {
            document.cookie = 'test=1; path=/';
            const ok = document.cookie.includes('test=');
            document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
            return ok;
        } catch {
            return false;
        }
    }

    static async _getDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this._dbName, 1);
            req.onupgradeneeded = () => {
                req.result.createObjectStore(this._storeName);
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    static async _idbSet(key, value) {
        const db = await this._getDB();
        const tx = db.transaction(this._storeName, 'readwrite');
        tx.objectStore(this._storeName).put(value, key);
        return tx.complete;
    }

    static async _idbGet(key) {
        const db = await this._getDB();
        const tx = db.transaction(this._storeName, 'readonly');
        const store = tx.objectStore(this._storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    static async _idbRemove(key) {
        const db = await this._getDB();
        const tx = db.transaction(this._storeName, 'readwrite');
        tx.objectStore(this._storeName).delete(key);
        return tx.complete;
    }

    static async _idbClear() {
        const db = await this._getDB();
        const tx = db.transaction(this._storeName, 'readwrite');
        tx.objectStore(this._storeName).clear();
        return tx.complete;
    }

    static _setCookie(k, v, d, secure = false) {
        const exp = new Date(Date.now() + d * 864e5).toUTCString();
        const secureFlag = secure || location.protocol === 'https:';
        const secureAttr = secureFlag ? '; Secure; SameSite=Lax' : '; SameSite=Lax';
        document.cookie = `${encodeURIComponent(k)}=${encodeURIComponent(v)}; expires=${exp}; path=/${secureAttr}`;
    }

    static _getCookie(k) {
        const name = encodeURIComponent(k) + "=";
        const cookies = decodeURIComponent(document.cookie).split('; ');
        for (const c of cookies) {
            if (c.startsWith(name)) return c.slice(name.length);
        }
        return null;
    }

    static _removeCookie(k) {
        document.cookie = `${encodeURIComponent(k)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    }

    static _clearCookies() {
        document.cookie.split('; ').forEach(c => {
            const key = c.split('=')[0];
            this._removeCookie(key);
        });
    }

    static async set(key, val, type = 'local', opts = {}) {
        const str = JSON.stringify(val);
        if (type === 'indexed') {
            await this._idbSet(key, val);
        } else if (type === 'local' && this._canUse('local')) {
            localStorage.setItem(key, str);
        } else if (type === 'session' && this._canUse('session')) {
            sessionStorage.setItem(key, str);
        } else if (type === 'cookie' && this._cookiesOn()) {
            this._setCookie(key, str, opts.days ?? 7, opts.secure ?? false);
        }
    }

    static async get(key, type = 'local') {
        let val = null;
        if (type === 'indexed') {
            return await this._idbGet(key);
        }
        if (type === 'local' && this._canUse('local')) {
            val = localStorage.getItem(key);
        } else if (type === 'session' && this._canUse('session')) {
            val = sessionStorage.getItem(key);
        } else if (type === 'cookie' && this._cookiesOn()) {
            val = this._getCookie(key);
        }

        try {
            return JSON.parse(decodeURIComponent(val));
        } catch {
            return val;
        }
    }

    static async remove(key, type = 'local') {
        if (type === 'indexed') {
            await this._idbRemove(key);
        } else if (type === 'local' && this._canUse('local')) {
            localStorage.removeItem(key);
        } else if (type === 'session' && this._canUse('session')) {
            sessionStorage.removeItem(key);
        } else if (type === 'cookie' && this._cookiesOn()) {
            this._removeCookie(key);
        }
    }

    static async clearAll() {
        if (this._canUse('local')) localStorage.clear();
        if (this._canUse('session')) sessionStorage.clear();
        if (this._cookiesOn()) this._clearCookies();
        await this._idbClear();
    }

    static async getAllIndexedDBItems() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this._dbName, 1);
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction(this._storeName, 'readonly');
                const store = tx.objectStore(this._storeName);
                const allData = {};
                const cursorRequest = store.openCursor();

                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        allData[cursor.key] = cursor.value;
                        cursor.continue();
                    } else {
                        resolve(allData);
                    }
                };

                cursorRequest.onerror = () => reject(cursorRequest.error);
            };
            request.onerror = () => reject(request.error);
        });
    }
}
