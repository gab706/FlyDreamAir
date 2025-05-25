import { Request, Response } from 'express';
import services from '../../data/services.json' with { type: "json" };
import testimonials from '../../data/testimonials.json' with { type: "json" };

export default function (req: Request, res: Response): void {
    res.render('pages/no-auth/index', {
        ...res.locals.context,
        services,
        testimonials
    });
}