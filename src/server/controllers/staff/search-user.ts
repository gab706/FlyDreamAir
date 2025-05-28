'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

/**
 * Controller: Search User (Staff Only)
 *
 * Purpose:
 * - Ensures the current user is authenticated and has at least staff-level access (role >= 1)
 * - Renders the user search interface for staff/admin users
 * - Redirects to /login if the user is unauthenticated or unauthorized
 */
export default function (req: Request, res: Response): void {
    const session = res.locals.context.userSession;
    const currentUser = res.locals.context.currentUser;

    // Block access if not logged in or if user has insufficient permissions
    if (!session?.loggedIn || currentUser?.role < 1)
        return res.redirect('/login');

    // Render the staff user search page with shared context
    res.render('pages/staff/search-user', {
        ...res.locals.context,
    });
}