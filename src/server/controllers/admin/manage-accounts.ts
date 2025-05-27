'use strict';
import { Request, Response } from 'express';

export default function (req: Request, res: Response): void {
    if (!res.locals.context.userSession?.loggedIn || res.locals.context.currentUser.role !== 3)
        return res.redirect('/login');

    res.render('pages/admin/manage-accounts', {
        ...res.locals.context
    });
}