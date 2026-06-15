/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */
'use strict';

import { readdirSync, copyFileSync, mkdirSync } from 'fs';
import path from 'path';

function copyDir(src, dest) {
    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

copyDir('./src/public', './build/src/public');