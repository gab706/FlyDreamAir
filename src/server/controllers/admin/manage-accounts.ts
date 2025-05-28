'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

/**
 * Controller: Manage Accounts (Admin Only)
 *
 * Purpose:
 * - Ensures the user is authenticated and has admin-level access (role === 3)
 * - Renders the admin account management interface
 * - Redirects to /login if the user is unauthenticated or unauthorized
 */
export default function (req: Request, res: Response): void {
    const session = res.locals.context.userSession;
    const currentUser = res.locals.context.currentUser;

    // Block access if not logged in or if user is not an admin
    if (!session?.loggedIn || currentUser?.role !== 3)
        return res.redirect('/login');

    // Render the admin manage accounts page with shared context
    res.render('pages/admin/manage-accounts', {
        ...res.locals.context
    });
}