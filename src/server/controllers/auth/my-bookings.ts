/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

export default function (req: Request, res: Response): void {
    const session = res.locals.context.userSession;

    if (!session?.loggedIn)
        return res.redirect('/login');

    res.render('pages/auth/my-bookings', {
        ...res.locals.context
    });
}
