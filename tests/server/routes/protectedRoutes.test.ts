/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import request from 'supertest';
import app from '../../../src/server/app.js';

/**
 * List of routes that require an authenticated user.
 * These are used to validate login protection and role-based access control.
 */
const protectedRoutesTest = [
    '/dashboard',
    '/my-bookings',
    '/my-rewards',
    '/new-booking',
    '/profile',
    '/manage-accounts',
    '/manage-data',
    '/manage-flights',
    '/manage-rewards',
    '/search-user'
];

/**
 * Fake session object representing a logged-in user.
 * Used to simulate different user roles via the currentUser cookie.
 */
const fakeSession = {
    userID: 1,
    loggedIn: true,
    adminImpersonating: null
};

/**
 * Base user object. Role will be dynamically overridden.
 */
const baseUser = {
    userID: 1,
    name: 'Test User',
    role: 0 // Default to lowest role (User)
};

/**
 * Helper function to generate a valid cookie array for a given user role.
 * @param {number} role - User role (0: User, 1: Staff, 2: Manager, 3: Admin)
 * @returns {string[]} - Cookie strings for test request
 */
function getCookiesWithRole(role: number): string[] {
    const user = { ...baseUser, role };
    return [
        `userSession=${encodeURIComponent(JSON.stringify(fakeSession))}`,
        `currentUser=${encodeURIComponent(JSON.stringify(user))}`
    ];
}

/**
 * Test Suite: Protected Routes
 * Verifies that:
 * - Unauthenticated users are redirected to /login
 * - Logged-in users with the appropriate role receive HTTP 200
 * - Role enforcement is correctly applied per route
 */
describe('Protected Routes', () => {

    /**
     * All protected routes should redirect to /login if no session is present
     */
    it.each(protectedRoutesTest)(`should redirect %s to /login if userSession is not set`, async (path) => {
        const res = await request(app).get(path);
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/login');
    });

    /**
     * Basic routes accessible to regular users (role 0)
     */
    const basicAccessRoutes = [
        '/dashboard',
        '/my-bookings',
        '/my-rewards',
        '/new-booking',
        '/profile'
    ];

    it.each(basicAccessRoutes)(`should return 200 for %s if userSession is set`, async (path) => {
        const res = await request(app)
            .get(path)
            .set('Cookie', getCookiesWithRole(0));
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('<!DOCTYPE html');
    });

    /**
     * /search-user should be accessible to Staff+ (role >= 1)
     */
    it('/search-user should return 200 if currentUser.role >= 1, else redirect to /login', async () => {
        const res1 = await request(app)
            .get('/search-user')
            .set('Cookie', getCookiesWithRole(1));
        expect(res1.statusCode).toBe(200);

        const res2 = await request(app)
            .get('/search-user')
            .set('Cookie', getCookiesWithRole(0));
        expect(res2.statusCode).toBe(302);
        expect(res2.headers.location).toBe('/login');
    });

    /**
     * /manage-flights and /manage-rewards require Manager+ (role >= 2)
     */
    ['/manage-flights', '/manage-rewards'].forEach(path => {
        it(`${path} should return 200 if currentUser.role >= 2, else redirect to /login`, async () => {
            const res1 = await request(app)
                .get(path)
                .set('Cookie', getCookiesWithRole(2));
            expect(res1.statusCode).toBe(200);

            const res2 = await request(app)
                .get(path)
                .set('Cookie', getCookiesWithRole(1));
            expect(res2.statusCode).toBe(302);
            expect(res2.headers.location).toBe('/login');
        });
    });

    /**
     * /manage-accounts and /manage-data require Admin role (role >= 3)
     */
    ['/manage-accounts', '/manage-data'].forEach(path => {
        it(`${path} should return 200 if currentUser.role >= 3, else redirect to /login`, async () => {
            const res1 = await request(app)
                .get(path)
                .set('Cookie', getCookiesWithRole(3));
            expect(res1.statusCode).toBe(200);

            const res2 = await request(app)
                .get(path)
                .set('Cookie', getCookiesWithRole(2));
            expect(res2.statusCode).toBe(302);
            expect(res2.headers.location).toBe('/login');
        });
    });
});