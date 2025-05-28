'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';
import tiers from '../../data/tiers.json' with { type: "json" };
import partners from '../../data/partners.json' with { type: "json" };
import faq from '../../data/faq.json' with { type: "json" };

/**
 * Controller: Rewards Page (Public / No Auth Required)
 *
 * Purpose:
 * - Serves the public-facing rewards page
 *
 * Behavior:
 * - Uses preloaded JSON data for:
 *   - Tier information
 *   - Partner details
 *   - Frequently Asked Questions
 * - Passes these into the EJS view for rendering
 *
 * @param req - Incoming HTTP request
 * @param res - HTTP response object
 */
export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/rewards', {
        ...res.locals.context,
        tiers,
        partners,
        faq
    });
}