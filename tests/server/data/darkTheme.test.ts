'use strict';
import request from 'supertest';
import app from '../../../src/server/app.js';

const fakeAdminSession = {
    userID: 1,
    loggedIn: true,
    adminImpersonating: null
};

const fakeAdminUser = {
    userID: 1,
    name: 'Test Admin',
    role: 3
};

const cookiesWithDarkTheme = [
    `userSession=${encodeURIComponent(JSON.stringify(fakeAdminSession))}`,
    `currentUser=${encodeURIComponent(JSON.stringify(fakeAdminUser))}`,
    `darkTheme=true`
];

const cookiesWithoutDarkTheme = [
    `userSession=${encodeURIComponent(JSON.stringify(fakeAdminSession))}`,
    `currentUser=${encodeURIComponent(JSON.stringify(fakeAdminUser))}`
];

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

describe('Dark Theme Rendering as Admin', () => {
    it.each(allRoutes)(`should render <body class="dark-theme"> on %s if darkTheme cookie is set`, async (path) => {
        const res = await request(app)
            .get(path)
            .set('Cookie', cookiesWithDarkTheme);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/<body\s+class=["']?dark-theme["']?[\s>]/);
    });

    it.each(allRoutes)(`should NOT render class="dark-theme" on %s if darkTheme cookie is missing`, async (path) => {
        const res = await request(app)
            .get(path)
            .set('Cookie', cookiesWithoutDarkTheme);

        expect(res.statusCode).toBe(200);
        expect(res.text).not.toMatch(/<body\s+class=["']?dark-theme["']?[\s>]/);
    });
});