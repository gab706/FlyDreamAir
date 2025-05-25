import { Request, Response } from 'express';

export default function (req: Request, res: Response): void {
    if (!res.locals.context.userSession?.loggedIn || res.locals.context.currentUser.role < 1)
        return res.redirect('/login');

    res.render('pages/staff/search-user', {
        ...res.locals.context,
    });
}