'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';
import fleet from '../../data/fleet.json' with { type: "json" };

/**
 * Controller: Cabins Page (Public / No Auth Required)
 *
 * Purpose:
 * - Renders the public cabins page with available fleet data
 * - No authentication or role required
 * - Uses shared context from middleware and appends fleet data
 *
 * @param req - Incoming request object
 * @param res - Server response object
 */
export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/cabins', {
        ...res.locals.context,
        fleet
    });
}