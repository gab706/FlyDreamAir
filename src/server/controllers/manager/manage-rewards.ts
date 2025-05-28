'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

/**
 * Controller: Manage Rewards (Manager Only)
 *
 * Purpose:
 * - Ensures the current user is authenticated and has at least manager-level access (role >= 2)
 * - Renders the reward management interface for managers/admins
 * - Redirects to /login if the user is unauthenticated or unauthorized
 */
export default function (req: Request, res: Response): void {
    const session = res.locals.context.userSession;
    const currentUser = res.locals.context.currentUser;

    // Block access if not logged in or if user has insufficient permissions
    if (!session?.loggedIn || currentUser?.role < 2)
        return res.redirect('/login');

    // Render the manager reward management page with shared context
    res.render('pages/manager/manage-rewards', {
        ...res.locals.context
    });
}