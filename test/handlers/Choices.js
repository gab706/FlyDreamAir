'use strict';
const inquirer = require('inquirer');

module.exports = class {
    /**
     * Prompts the user to select one or more test case files from a given list.
     *
     * @param {Array} modules - An array of module objects with at least a `name` property.
     * @returns {Promise<Array>} An array of selected module objects.
     */
    static async getFiles(modules) {
        // Convert each module into a choice format compatible with inquirer
        const choices = modules.map(m => ({ name: m.name, value: m }));

        // Prompt the user with a checkbox list of available test case files
        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedModules',
                message: 'Which Test Cases would you like to run?',
                choices,
            },
        ]);

        // Return the modules the user selected
        return answers.selectedModules;
    }
}