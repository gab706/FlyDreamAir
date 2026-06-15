/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */
import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './router.js';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app: Application = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../src/public/views'));

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

app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`));
