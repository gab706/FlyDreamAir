'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request } from 'express';

/**
 * ServerCookieWrapper
 * A utility class to safely extract and parse cookie values from incoming Express requests.
 */
class ServerCookieWrapper {
    /**
     * Retrieves the raw cookie value by key from the request headers.
     *
     * @param req - The Express request object.
     * @param key - The name of the cookie to retrieve.
     * @returns The decoded cookie value or null if not found.
     */
    static getCookieValue(req: Request, key: string): string | null {
        const raw = req.headers.cookie;
        if (!raw) return null;

        const cookie = raw
            .split(';') // Split multiple cookies
            .map(c => c.trim())
            .map(c => c.split('=')) // Separate key/value
            .find(([k]) => decodeURIComponent(k) === key);

        return cookie ? decodeURIComponent(cookie[1]) : null;
    }

    /**
     * Attempts to parse a JSON string into an object.
     *
     * @param val - The raw cookie value (expected JSON string).
     * @returns The parsed object or null if parsing fails.
     */
    static parseJSON<T>(val: string | null): T | null {
        if (!val) return null;
        try {
            return JSON.parse(val) as T;
        } catch {
            return null;
        }
    }

    /**
     * Fetches and parses a cookie value into an object.
     *
     * @param req - The Express request object.
     * @param key - The cookie name to retrieve and parse.
     * @returns The parsed object of type T or null.
     */
    static getParsed<T>(req: Request, key: string): T | null {
        return this.parseJSON<T>(this.getCookieValue(req, key));
    }
}

export default ServerCookieWrapper;