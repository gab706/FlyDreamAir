'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import app from './app.js';
import http from 'http';

const PORT = process.env.PORT || 3000;

// Start the Express application and listen on the configured port
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    /**
     * Reverse Proxy Verification (Nginx Health Check)
     *
     * This block sends a test request to the internal health endpoint `/__proxycheck__`,
     * The goal is to verify whether expected proxy headers (X-Forwarded-For and X-Forwarded-Proto) are:
     *   1. Received by the server
     *   2. Recognized and trusted by Express (requires `app.set('trust proxy', true)`)
     *
     * This helps confirm that your Nginx reverse proxy is configured and forwarding correctly.
     */
    const req = http.get(`http://localhost:${PORT}/__proxycheck__`, {
        headers: {
            // Simulate what Nginx would normally forward to the backend
            'X-Forwarded-Proto': 'https',
            'X-Forwarded-For': '127.0.0.1'
        }
    }, (res) => {
        let data = '';

        // Buffer the JSON response body
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);

                if (parsed.forwardedFor || parsed.forwardedProto) {
                    console.log('[✓] Nginx reverse proxy headers received and recognized by Express.');
                } else {
                    console.warn('[!] Warning: Reverse proxy headers missing or ignored. Ensure Nginx is forwarding headers and `app.set("trust proxy", true)` is enabled.');
                }
            } catch {
                console.error('[!] Reverse proxy header response was invalid JSON.');
            }
        });
    });

    // Handle any request failure (e.g., server not listening or path missing)
    req.on('error', (err) => {
        console.error('[!] Failed to verify reverse proxy:', err.message);
    });
});