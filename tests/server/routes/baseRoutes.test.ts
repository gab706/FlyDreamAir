/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import request from 'supertest';
import app from '../../../src/server/app.js';

/**
 * Fake user session object representing a logged-in user.
 * Used for simulating authentication when accessing protected or redirected routes.
 */
const fakeSession = {
    userID: 1,
    loggedIn: true,
    adminImpersonating: null
};

/**
 * Test Suite: Base Routes
 * Purpose: Validate access behavior for core routes including redirections, public page rendering,
 * and session-based redirects for /login and /register.
 */
describe('Base Routes', () => {
    /**
     * Root route test
     * Expect the base URL "/" to redirect to "/index"
     */
    it('should redirect root path / to /index', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(302); // 302 = Found (temporary redirect)
        expect(res.header.location).toBe('/index'); // Validate redirect location
    });

    /**
     * List of publicly accessible pages that do not require authentication
     * These should all return status 200 and contain valid HTML output
     */
    const publicPages = [
        '/index',
        '/cabins',
        '/facilities',
        '/locations',
        '/menu',
        '/rewards',
        '/cookie-policy',
        '/privacy-policy',
        '/terms-and-conditions',
        '/travel-policy'
    ];

    // Iterate through public pages and verify accessibility and valid HTML response
    publicPages.forEach(path => {
        it(`should return 200 for public page ${path}`, async () => {
            const res = await request(app).get(path);
            expect(res.statusCode).toBe(200); // Page accessible
            expect(res.text).toContain('<!DOCTYPE html'); // Check that it's a valid HTML page
        });
    });

    /**
     * Access to login and registration pages without an active session
     * Should return 200 and render the respective pages
     */
    it('should return 200 for /login if no userSession is set', async () => {
        const res = await request(app).get('/login');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('<!DOCTYPE html');
    });

    it('should return 200 for /register if no userSession is set', async () => {
        const res = await request(app).get('/register');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('<!DOCTYPE html');
    });

    /**
     * Authenticated users accessing /login or /register should be redirected to /dashboard
     * Validates redirect logic when session cookie indicates an already logged-in user
     */
    it('should redirect /login to /dashboard if userSession.loggedIn is true', async () => {
        const res = await request(app)
            .get('/login')
            .set('Cookie', [`userSession=${encodeURIComponent(JSON.stringify(fakeSession))}`]);

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/dashboard');
    });

    it('should redirect /register to /dashboard if userSession.loggedIn is true', async () => {
        const res = await request(app)
            .get('/register')
            .set('Cookie', [`userSession=${encodeURIComponent(JSON.stringify(fakeSession))}`]);

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/dashboard');
    });
});