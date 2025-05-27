'use strict';
import request from 'supertest';
import app from '../../../src/server/app.js';

describe('Static File Access Control', () => {
    it('should allow access to .js file in /partials', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/dashboard-page-search.js');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('application/javascript');
    });

    it('should allow access to .css file in /partials', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/dashboard-page-search.css');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('text/css');
    });

    it('should redirect disallowed file types in /partials to /index', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/secret.txt');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
    });

    it('should redirect HTML/EJS access in /partials to /index', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/component.ejs');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
    });

    it('should allow access to global.css', async () => {
        const res = await request(app).get('/css/global.css');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('text/css');
    });

    it('should allow access to logo.png', async () => {
        const res = await request(app).get('/images/logo.png');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toMatch(/image/);
    });

    it('should allow access to global.js', async () => {
        const res = await request(app).get('/js/global.js');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('application/javascript');
    });

    it('should allow access to jquery.min.js in lib/js', async () => {
        const res = await request(app).get('/lib/js/jquery.min.js');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('application/javascript');
    });

    it('should allow access to hero.mp4 in /videos', async () => {
        const res = await request(app).get('/videos/hero.mp4');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toMatch(/video/);
    });

    it('should NOT allow access to any EJS in /views', async () => {
        const res = await request(app).get('/views/pages/index.ejs');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
        expect(res.headers['content-disposition']).toBeUndefined();
        expect(res.text).not.toMatch(/<%|<%=|<%-/);
    });

    it('should NOT allow directory access to /views', async () => {
        const res = await request(app).get('/views/');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
        expect(res.headers['content-disposition']).toBeUndefined();
        expect(res.text).not.toMatch(/<%|<%=|<%-/);
    });

});