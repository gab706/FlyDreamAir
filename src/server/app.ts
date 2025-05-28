'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './router.js';

// Resolve current file and directory paths using ESM-compatible method
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

// Create the Express application instance
const app: Application = express();

// Set EJS as the view engine for rendering HTML templates
app.set('view engine', 'ejs');

// Enable Express to trust proxy headers like X-Forwarded-For
app.set('trust proxy', true);

// Define the directory where EJS templates are located
app.set('views', path.join(__dirname, '../../src/public/views'));

/**
 * Middleware: Enforce aggressive no-cache headers for all responses
 * Prevents cached or stale views from being used in dynamic content
 */
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

// Serve static files (JS, CSS, images, fonts, etc.) from /public
app.use(express.static(path.join(__dirname, '../../src/public')));

// Parse cookies for session and preference management
app.use(cookieParser());

// Load and apply all route definitions
app.use(router);

/**
 * Middleware: Secure access to /partials
 * Only allow .js and .css files to be served from /views/partials
 * All other file types are ignored and passed down middleware stack
 */
app.use('/partials', (req: Request, res: Response, next: NextFunction): void => {
    const allowedExtensions: string[] = ['.js', '.css'];

    const isAllowed: boolean = allowedExtensions.some(ext => req.path.endsWith(ext));

    if (!isAllowed)
        return next(); // Disallow non-js/css files

    // Serve the file from the partials directory
    express.static(path.join(__dirname, '../../src/public/views/partials'))(req, res, next);
});

/**
 * Middleware: Redirect all unknown paths to /index
 * Excludes /dummy-data endpoints to allow development utilities
 */
app.use((req, res, next) => {
    if (req.path.startsWith('/dummy-data'))
        return next();

    res.redirect('/index');
});

/**
 * Health Check Route: /__proxycheck__
 * Used internally by server.ts to verify that proxy headers are being received correctly
 */
app.get('/__proxycheck__', (req, res) => {
    res.json({
        forwardedFor: req.headers['x-forwarded-for'] || null,
        forwardedProto: req.headers['x-forwarded-proto'] || null
    });
});

export default app;