'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

/**
 * Controller: Login Page (Public / No Auth Required)
 *
 * Purpose:
 * - Displays the login page for unauthenticated users
 * - Redirects already logged-in users to their dashboard
 *
 * Behavior:
 * - If a valid `userSession.loggedIn` is found, user is redirected to `/dashboard`
 * - Otherwise, renders the `pages/no-auth/login` EJS view
 *
 * @param req - Incoming HTTP request
 * @param res - HTTP response object
 */
export default function (req: Request, res: Response): void {
    if (res.locals.context.userSession?.loggedIn)
        return res.redirect('/dashboard');

    res.render('pages/no-auth/login');
}