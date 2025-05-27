'use strict';
import { Request, Response } from 'express';
import fleet from '../../data/fleet.json' with { type: "json" };

export default function (req: Request, res: Response): void {
   res.render('pages/no-auth/cabins', {
        ...res.locals.context,
        fleet
    });
}