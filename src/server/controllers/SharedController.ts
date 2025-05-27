'use strict';
import { Request, Response, NextFunction } from 'express';
import ServerCookieWrapper from '../utility/ServerCookieWrapper.js';
import dashboard_navbar from '../data/dashboard_navbar.json' with { type: "json" };

const restrictedPaths = [
    '/manage-accounts',
    '/manage-data',
    '/dashboard',
    '/my-bookings',
    '/my-rewards',
    '/new-booking',
    '/profile',
    '/manage-flights',
    '/manage-rewards',
    '/login',
    '/register',
    '/search-user'
];

export default function SharedController(req: Request, res: Response, next: NextFunction): void {
    const userSession: any = ServerCookieWrapper.getParsed(req, 'userSession');
    const darkTheme: any = ServerCookieWrapper.getParsed<string>(req, 'darkTheme');
    const currentUser: any = ServerCookieWrapper.getParsed(req, 'currentUser');

    res.locals.context = {
        userSession,
        currentUser,
        darkTheme,
        navbarItems: dashboard_navbar,
        isRestrictedOnMobile: restrictedPaths.includes(req.path)
    };

    next();
}