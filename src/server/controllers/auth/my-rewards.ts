import { Request, Response } from 'express';

export default function (req: Request, res: Response): void {
    if (!res.locals.context.userSession?.loggedIn)
        return res.redirect('/login');

    res.render('pages/auth/my-rewards', {
        ...res.locals.context
    });
}