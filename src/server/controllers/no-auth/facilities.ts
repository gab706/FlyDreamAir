'use strict';
import { Request, Response } from 'express';
import facilities from '../../data/facilities.json' with { type: "json" };

export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/facilities', {
        ...res.locals.context,
        facilities
    });
}