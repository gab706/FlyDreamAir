'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';
import services from '../../data/services.json' with { type: "json" };
import testimonials from '../../data/testimonials.json' with { type: "json" };

/**
 * Controller: Landing Page (Public / No Auth Required)
 *
 * Purpose:
 * - Renders the main FlyDreamAir homepage for unauthenticated users
 * - Injects key sections including services and customer testimonials
 * - Includes shared layout context (theme, session info, nav items, etc.)
 *
 * @param req - Incoming request object
 * @param res - Server response object
 */
export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/index', {
        ...res.locals.context,
        services,
        testimonials
    });
}