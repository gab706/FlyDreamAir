import request from 'supertest';
import app from '../../../src/server/app.js';

const fakeSession = {
    userID: 1,
    loggedIn: true,
    adminImpersonating: null
};

describe('Base Routes', () => {
    it('should redirect root path / to /index', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(302);
        expect(res.header.location).toBe('/index');
    });

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

    publicPages.forEach(path => {
        it(`should return 200 for public page ${path}`, async () => {
            const res = await request(app).get(path);
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('<!DOCTYPE html');
        });
    });

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