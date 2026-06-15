/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';
import facilities from '../../data/facilities.json' with { type: "json" };

export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/facilities', {
        ...res.locals.context,
        facilities
    });
}
