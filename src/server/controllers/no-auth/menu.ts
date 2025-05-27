'use strict';
import { Request, Response } from 'express';
import menu from '../../data/menu.json' with { type: "json" };

export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/menu', {
        ...res.locals.context,
        menu
    });
}