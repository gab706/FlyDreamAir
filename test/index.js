'use strict';

// Set a global variable __root to the current directory name
global.__root = __dirname;

// Import required Node.js modules
const { exec } = require('child_process'); // Used to run shell commands
const path = require('path');              // For handling and transforming file paths

// Import custom modules/handlers
const ConsoleFormatter = require('./handlers/ConsoleFormatter'); // Handles coloured/formatting console output
const ModuleScanner = require('./handlers/ModuleScanner');       // Scans for test case modules/files
const Choices = require('./handlers/Choices');                   // Allows selection or processing of test files

/**
 * Executes a Jest test file using a shell command.
 *
 * @param {string} filePath - The full path to the Jest test file.
 * @returns {Promise} Resolves with stdout if successful; rejects with error details otherwise.
 */
function runJestFile(filePath) {
    return new Promise((resolve, reject) => {
        const normalizedPath = filePath.replace(/\\/g, '/');
        const command = `npx jest "${normalizedPath}" --runInBand --silent=false`; // runInBand ensures tests run sequentially

        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error)
                return reject({ error, stdout, stderr });

            resolve({ stdout });
        });
    });
}

// Main async function that runs test cases
(async () => {
    try {
        // Create a new module scanner that targets the "cases" directory
        const scanner = new ModuleScanner('cases');

        // Print credits or introductory message to console
        await ConsoleFormatter.printCredits(true);

        // Get a list of selected test files/modules from user or pre-defined logic
        const modules = await Choices.getFiles(scanner.scan());

        // Iterate over each selected test file
        for (const { name } of modules) {
            const fullPath = path.join(__dirname, 'cases', name); // Construct full path to the file

            // Inform the user that tests are about to run
            console.log(ConsoleFormatter.colourise(`\nRunning test case(s) in file ${name} now, standby...`, 'yellow'));

            try {
                // Run the test and capture output
                const { stdout } = await runJestFile(fullPath);
                // Log success message
                console.log(ConsoleFormatter.colourise(`✔ Test Cases in file ${name} have all Passed`, 'green', ['BOLD']));
            } catch ({ error, stdout, stderr }) {
                // Log failure message and the test output
                console.log(ConsoleFormatter.colourise(`✖ Test Cases in file ${name} FAILED`, 'red', ['BOLD']));
                console.log(ConsoleFormatter.colourise(stdout || stderr, 'red'));
            }
        }
    } catch (err) {
        // Handle unexpected errors gracefully
        console.error('Something went wrong:', err);
        process.exit(1);
    }
})();
