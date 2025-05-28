'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { readdirSync, copyFileSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * Recursively copies the contents of a directory to a destination.
 *
 * @param {string} src - The source directory path.
 * @param {string} dest - The destination directory path.
 */
function copyDir(src, dest) {
    // Ensure the destination directory exists
    mkdirSync(dest, { recursive: true });

    // Read all entries (files and subdirectories) in the source directory
    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Recursively copy subdirectories
            copyDir(srcPath, destPath);
        } else {
            // Copy individual files
            copyFileSync(srcPath, destPath);
        }
    }
}

// Start copying from source to destination directory
copyDir('./src/public', './build/src/public');