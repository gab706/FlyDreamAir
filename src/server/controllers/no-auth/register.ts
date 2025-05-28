'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

/**
 * Controller: User Registration Page (Public / No Auth Required)
 *
 * Purpose:
 * - Handles GET requests to the registration page
 *
 * Behavior:
 * - If a user session is active (already logged in), redirect to /dashboard
 * - Otherwise, render the public-facing registration view
 *
 * @param req - Incoming HTTP request
 * @param res - HTTP response object
 */
export default function (req: Request, res: Response): void {
    if (res.locals.context.userSession?.loggedIn)
        return res.redirect('/dashboard');

    res.render('pages/no-auth/register');
}