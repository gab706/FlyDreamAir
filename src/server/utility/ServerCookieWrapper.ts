'use strict';
import { Request } from 'express';

class ServerCookieWrapper {
    static getCookieValue(req: Request, key: string): string | null {
        const raw = req.headers.cookie;
        if (!raw) return null;

        const cookie = raw
            .split(';')
            .map(c => c.trim())
            .map(c => c.split('='))
            .find(([k]) => decodeURIComponent(k) === key);

        return cookie ? decodeURIComponent(cookie[1]) : null;
    }

    static parseJSON<T>(val: string | null): T | null {
        if (!val) return null;
        try {
            return JSON.parse(val) as T;
        } catch {
            return null;
        }
    }

    static getParsed<T>(req: Request, key: string): T | null {
        return this.parseJSON<T>(this.getCookieValue(req, key));
    }
}

export default ServerCookieWrapper;