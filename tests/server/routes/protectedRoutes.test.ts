import request from 'supertest';
import app from '../../../src/server/app.js';

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

const fakeSession = {
    userID: 1,
    loggedIn: true,
    adminImpersonating: null
};

const baseUser = {
    userID: 1,
    name: 'Test User',
    role: 0
};

function getCookiesWithRole(role: number) {
    const user = { ...baseUser, role };
    return [
        `userSession=${encodeURIComponent(JSON.stringify(fakeSession))}`,
        `currentUser=${encodeURIComponent(JSON.stringify(user))}`
    ];
}

describe('Protected Routes', () => {
    it.each(protectedRoutesTest)(`should redirect %s to /login if userSession is not set`, async (path) => {
        const res = await request(app).get(path);
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/login');
    });

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