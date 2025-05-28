'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

/**
 * Controller: Dashboard (Auth Only)
 *
 * Purpose:
 * - Ensures the current user is authenticated
 * - Renders the main dashboard for logged-in users
 * - Redirects to /login if the user is not logged in
 */
export default function (req: Request, res: Response): void {
    const session = res.locals.context.userSession;

    // Block access if not logged in
    if (!session?.loggedIn)
        return res.redirect('/login');

    // Render the dashboard page with shared context
    res.render('pages/auth/dashboard', {
        ...res.locals.context
    });
}