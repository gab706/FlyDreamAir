import { Request, Response } from 'express';
import tiers from '../../data/tiers.json' with { type: "json" };
import partners from '../../data/partners.json' with { type: "json" };
import faq from '../../data/faq.json' with { type: "json" };

export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/rewards', {
        ...res.locals.context,
        tiers,
        partners,
        faq
    });
}