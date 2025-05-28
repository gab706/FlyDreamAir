'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';
import menu from '../../data/menu.json' with { type: "json" };

/**
 * Controller: In-Flight Menu Page (Public / No Auth Required)
 *
 * Purpose:
 * - Serves the public-facing in-flight menu page
 *
 * Behavior:
 * - Renders the `pages/no-auth/menu` view with:
 *   - User session context (res.locals.context)
 *   - Parsed menu data from JSON
 *
 * @param req - Incoming HTTP request
 * @param res - HTTP response object
 */
export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/menu', {
        ...res.locals.context,
        menu
    });
}