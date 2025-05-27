'use strict';
import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './router.js';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const app: Application = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../src/public/views'));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

app.use(express.static(path.join(__dirname, '../../src/public')));
app.use(cookieParser());
app.use(router);

app.use('/partials', (req: Request, res: Response, next: NextFunction): void => {
    const allowedExtensions: string[] = ['.js', '.css'];

    const isAllowed: boolean = allowedExtensions.some(ext => req.path.endsWith(ext));

    if (!isAllowed)
        return next();

    express.static(path.join(__dirname, '../../src/public/views/partials'))(req, res, next);
});

app.use((req, res, next) => {
    if (req.path.startsWith('/dummy-data'))
        return next();
    res.redirect('/index');
});

export default app;