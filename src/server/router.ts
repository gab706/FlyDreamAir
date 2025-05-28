'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import fs, { Dirent } from 'fs';
import SharedController from './controllers/SharedController.js';

const router: Router = Router();
// Resolve current file and directory paths using ESM-compatible method
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

// Define root directories for EJS views and route-specific controllers
const viewsDir: string = path.join(__dirname, '../../src/public/views/pages');
const controllersDir: string = path.join(__dirname, './controllers');

// Redirect root path to /index for consistency
router.get('/', (req: Request, res: Response) => {
    res.redirect('/index');
});

/**
 * Asynchronously discovers all EJS templates in the views directory
 * and dynamically creates Express routes based on the directory structure.
 */
async function discoverRoutes(): Promise<void> {
    /**
     * Recursively traverse view directory to map EJS files to routes.
     */
    const recurse = async (dir: string): Promise<void> => {
        const entries: Dirent[] = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            // If directory, recurse further
            if (entry.isDirectory()) {
                await recurse(fullPath);
                continue;
            }

            // Only handle .ejs files
            if (!entry.name.endsWith('.ejs')) continue;

            // Determine route and view/controller paths
            const filename = path.basename(entry.name, '.ejs');
            const relativePath = path.relative(viewsDir, fullPath).replace(/\\/g, '/').replace('.ejs', '');
            const route = '/' + filename; // URL route: /about, /login, etc.
            const viewPath = `pages/${relativePath}`; // EJS view path
            const controllerPath = path.join(controllersDir, relativePath + '.js'); // Optional controller file
            const fullViewPath = path.join(viewsDir, relativePath + '.ejs');

            /**
             * Define dynamic GET route with fallback logic:
             * 1. Executes SharedController first (for shared logic / context setup)
             * 2. If a matching controller exists and exports a function → use it
             * 3. Else render the corresponding .ejs view
             * 4. If neither found → 404 fallback redirect to /index
             */
            router.get(route, SharedController, async (req: Request, res: Response, next: NextFunction) => {
                if (fs.existsSync(controllerPath)) {
                    try {
                        const controller = await import(`file://${controllerPath}`);
                        if (typeof controller.default === 'function')
                            return controller.default(req, res, next);
                    } catch (err) {
                        return res.status(500).send('Controller Error');
                    }
                }

                if (fs.existsSync(fullViewPath)) {
                    return res.render(viewPath, {
                        ...res.locals.context
                    });
                }

                return res.status(404).redirect('/index');
            });
        }
    };

    await recurse(viewsDir);
}

// Immediately run discovery on app startup
await discoverRoutes();

export default router;