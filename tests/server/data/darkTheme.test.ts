/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import request from 'supertest';
import app from '../../../src/server/app.js';

/**
 * Test data setup:
 * Simulates an admin user session and user data typically stored in cookies.
 * This enables authenticated access to protected routes during tests.
 */
const fakeAdminSession = {
    userID: 1,
    loggedIn: true,
    adminImpersonating: null // Not impersonating another user
};

const fakeAdminUser = {
    userID: 1,
    name: 'Test Admin',
    role: 3 // Admin role (highest permission level)
};

/**
 * Cookie sets to simulate different user preferences:
 * - One includes the 'darkTheme' cookie set to true
 * - The other omits the 'darkTheme' cookie entirely
 */
const cookiesWithDarkTheme = [
    `userSession=${encodeURIComponent(JSON.stringify(fakeAdminSession))}`,
    `currentUser=${encodeURIComponent(JSON.stringify(fakeAdminUser))}`,
    `darkTheme=true`
];

const cookiesWithoutDarkTheme = [
    `userSession=${encodeURIComponent(JSON.stringify(fakeAdminSession))}`,
    `currentUser=${encodeURIComponent(JSON.stringify(fakeAdminUser))}`
];

/**
 * Routes to be tested:
 * These include both public and protected pages in the application.
 * Every route is checked for proper <body> class rendering based on the darkTheme cookie.
 */
const allRoutes = [
    '/index',
    '/cabins',
    '/facilities',
    '/locations',
    '/menu',
    '/rewards',
    '/cookie-policy',
    '/privacy-policy',
    '/terms-and-conditions',
    '/travel-policy',
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
 * Test Suite: Dark Theme Rendering as Admin
 * Purpose: To validate that all routes respect the user's theme preference.
 * If 'darkTheme=true' is set in cookies, the HTML output should contain <body class="dark-theme">
 * If not set, the class should be absent to reflect the light/default theme.
 */
describe('Dark Theme Rendering as Admin', () => {
    /**
     * Loop over all routes using Jest's `it.each`
     * Test that <body> tag correctly includes the dark-theme class when the cookie is present.
     */
    it.each(allRoutes)(`should render <body class="dark-theme"> on %s if darkTheme cookie is set`, async (path) => {
        const res = await request(app)
            .get(path)
            .set('Cookie', cookiesWithDarkTheme);

        expect(res.statusCode).toBe(200); // Ensure route responded OK
        expect(res.text).toMatch(/<body\s+class=["']?dark-theme["']?[\s>]/); // Confirm correct theme class
    });

    /**
     * Repeat the same loop for the scenario where darkTheme cookie is not provided.
     * Confirm that the class is not applied and default theme behavior is followed.
     */
    it.each(allRoutes)(`should NOT render class="dark-theme" on %s if darkTheme cookie is missing`, async (path) => {
        const res = await request(app)
            .get(path)
            .set('Cookie', cookiesWithoutDarkTheme);

        expect(res.statusCode).toBe(200); // Ensure route responded OK
        expect(res.text).not.toMatch(/<body\s+class=["']?dark-theme["']?[\s>]/); // Confirm dark class is absent
    });
});