/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { Request, Response } from 'express';

export default function (req: Request, res: Response): void {
    if (res.locals.context.userSession?.loggedIn)
        return res.redirect('/dashboard');

    res.render('pages/no-auth/register');
}
