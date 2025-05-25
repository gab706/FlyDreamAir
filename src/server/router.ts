import { fileURLToPath } from 'url';
import path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import fs, { Dirent } from 'fs';
import SharedController from './controllers/SharedController.js';

const router: Router = Router();
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const viewsDir: string = path.join(__dirname, '../src/public/views/pages');
const controllersDir: string = path.join(__dirname, './controllers');

router.get('/', (req: Request, res: Response) => {
    res.redirect('/index');
});

async function discoverRoutes(): Promise<void> {
    const recurse = async (dir: string): Promise<void> => {
        const entries: Dirent[] = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await recurse(fullPath);
                continue;
            }

            if (!entry.name.endsWith('.ejs')) continue;

            const filename = path.basename(entry.name, '.ejs');
            const relativePath = path.relative(viewsDir, fullPath).replace(/\\/g, '/').replace('.ejs', '');
            const route = '/' + filename;
            const viewPath = `pages/${relativePath}`;
            const controllerPath = path.join(controllersDir, relativePath + '.js');
            const fullViewPath = path.join(viewsDir, relativePath + '.ejs');

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
                        ...res.locals.context,
                        title: filename
                    });
                }

                return res.status(404).render('pages/error', {
                    ...res.locals.context,
                    title: '404 Not Found'
                });
            });
        }
    };

    await recurse(viewsDir);
}

await discoverRoutes();

export default router;