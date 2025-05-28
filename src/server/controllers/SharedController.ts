'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response, NextFunction } from 'express';
import ServerCookieWrapper from '../utility/ServerCookieWrapper.js';
import dashboard_navbar from '../data/dashboard_navbar.json' with { type: "json" };

/**
 * List of routes that are considered restricted (e.g., not shown on mobile nav,
 * require authentication, or have role-based access conditions).
 */
const restrictedPaths = [
    '/manage-accounts',
    '/manage-data',
    '/dashboard',
    '/my-bookings',
    '/my-rewards',
    '/new-booking',
    '/profile',
    '/manage-flights',
    '/manage-rewards',
    '/login',
    '/register',
    '/search-user'
];

/**
 * SharedController middleware
 *
 * Purpose:
 * - Attaches common context variables to res.locals for use in all EJS views
 * - Centralizes cookie parsing (userSession, darkTheme, currentUser)
 * - Flags whether the current route is restricted (used for responsive UI behavior)
 *
 * @param req - Incoming request object
 * @param res - Server response object
 * @param next - Middleware continuation function
 */
export default function SharedController(req: Request, res: Response, next: NextFunction): void {
    const userSession: any = ServerCookieWrapper.getParsed(req, 'userSession');
    const darkTheme: any = ServerCookieWrapper.getParsed<string>(req, 'darkTheme');
    const currentUser: any = ServerCookieWrapper.getParsed(req, 'currentUser');

    // Store shared data in locals for EJS views to access
    res.locals.context = {
        userSession,
        currentUser,
        darkTheme,
        navbarItems: dashboard_navbar,
        isRestrictedOnMobile: restrictedPaths.includes(req.path)
    };

    next(); // Continue to the controller or view renderer
}