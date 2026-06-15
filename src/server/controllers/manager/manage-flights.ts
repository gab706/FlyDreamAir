/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

export default function (req: Request, res: Response): void {
    const session = res.locals.context.userSession;
    const currentUser = res.locals.context.currentUser;

    if (!session?.loggedIn || currentUser?.role < 2)
        return res.redirect('/login');

    res.render('pages/manager/manage-flights', {
        ...res.locals.context
    });
}
