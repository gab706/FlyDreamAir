'use strict';

// Import necessary functions from the Node.js 'fs' and 'path' modules
const { readdirSync, statSync } = require('fs');
const path = require('path');

// Exporting an anonymous class for scanning a directory for JavaScript files
module.exports = class {
    constructor(directory) {
        // Set the absolute path to the target directory using the global __root
        this.directory = `${__root}/${directory}`;
        // Initialize an empty array to store module file information
        this.modules = [];
    }

    /**
     * Scans the directory for .js files and collects their names and paths.
     *
     * @returns {Array} List of module objects with `name` and `path`.
     */
    scan() {
        // Read all files in the specified directory
        const files = readdirSync(this.directory);

        for (const file of files) {
            const fullPath = path.join(this.directory, file);

            // Check if the current item is a regular .js file
            if (statSync(fullPath).isFile() && path.extname(fullPath) === '.js')
                this.modules.push({ name: file, path: fullPath });
        }

        // Return the collected modules
        return this.modules;
    }
}