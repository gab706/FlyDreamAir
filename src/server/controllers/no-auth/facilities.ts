'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';
import facilities from '../../data/facilities.json' with { type: "json" };

/**
 * Controller: Facilities Page (Public / No Auth Required)
 *
 * Purpose:
 * - Renders the public-facing facilities overview page
 * - Loads facility content from static JSON file
 * - Injects shared context (theme, session, etc.) from middleware
 *
 * @param req - Incoming request object
 * @param res - Server response object
 */
export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/facilities', {
        ...res.locals.context,
        facilities
    });
}