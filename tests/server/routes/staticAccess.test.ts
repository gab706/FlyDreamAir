/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import request from 'supertest';
import app from '../../../src/server/app.js';

/**
 * Test Suite: Static File Access Control
 * Purpose: Ensures proper access permissions and security restrictions on static files
 * across different public directories (e.g., /css, /js, /images, /partials, /views).
 */
describe('Static File Access Control', () => {

    /**
     * ALLOW: JavaScript in /partials
     */
    it('should allow access to .js file in /partials', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/dashboard-page-search.js');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('application/javascript');
    });

    /**
     * ALLOW: CSS in /partials
     */
    it('should allow access to .css file in /partials', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/dashboard-page-search.css');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('text/css');
    });

    /**
     * BLOCK: Disallowed file types in /partials
     * e.g., .txt files should not be publicly accessible
     */
    it('should redirect disallowed file types in /partials to /index', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/secret.txt');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
    });

    /**
     * BLOCK: EJS or HTML files under /partials
     */
    it('should redirect HTML/EJS access in /partials to /index', async () => {
        const res = await request(app).get('/partials/dashboard-page-search/component.ejs');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
    });

    /**
     * ALLOW: global.css from /css directory
     */
    it('should allow access to global.css', async () => {
        const res = await request(app).get('/css/global.css');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('text/css');
    });

    /**
     * ALLOW: logo.png from /images directory
     */
    it('should allow access to logo.png', async () => {
        const res = await request(app).get('/images/logo.png');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toMatch(/image/);
    });

    /**
     * ALLOW: global.js from /js directory
     */
    it('should allow access to global.js', async () => {
        const res = await request(app).get('/js/global.js');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('application/javascript');
    });

    /**
     * ALLOW: Library JS from /lib/js
     */
    it('should allow access to jquery.min.js in lib/js', async () => {
        const res = await request(app).get('/lib/js/jquery.min.js');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('application/javascript');
    });

    /**
     * ALLOW: MP4 video from /videos directory
     */
    it('should allow access to hero.mp4 in /videos', async () => {
        const res = await request(app).get('/videos/hero.mp4');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toMatch(/video/);
    });

    /**
     * BLOCK: Direct access to any EJS file under /views
     * EJS templates should never be exposed publicly
     */
    it('should NOT allow access to any EJS in /views', async () => {
        const res = await request(app).get('/views/pages/index.ejs');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
        expect(res.headers['content-disposition']).toBeUndefined();
        expect(res.text).not.toMatch(/<%|<%=|<%-/); // Ensure EJS code isn't leaked
    });

    /**
     * BLOCK: Directory listing under /views
     * Prevent raw folder browsing or index exposure
     */
    it('should NOT allow directory access to /views', async () => {
        const res = await request(app).get('/views/');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/index');
        expect(res.headers['content-disposition']).toBeUndefined();
        expect(res.text).not.toMatch(/<%|<%=|<%-/); // No template output
    });
});