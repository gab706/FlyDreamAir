'use strict';
const figlet = require('figlet'); // Used to generate ASCII art for the banner/logo

module.exports = class {
    // Define ANSI escape codes for text colours
    static TEXT_COLOUR = {
        red: '\x1b[91m',
        green: '\x1b[92m',
        yellow: '\x1b[93m',
        blue: '\x1b[94m',
        purple: '\x1b[95m',
        cyan: '\x1b[96m',
        white: '\x1b[97m',
    };

    // Define ANSI escape codes for text styles
    static TEXT_FORMAT = {
        bold: '\x1b[1m',
        italic: '\x1b[3m',
        underline: '\x1b[4m',
        blink: '\x1b[5m',
        invert: '\x1b[7m',
    };

    // ANSI reset code to clear formatting after styled output
    static RESET = '\x1b[0m';

    /**
     * Checks if a given colour is valid based on the defined colour codes.
     * @param {string} colour
     * @returns {boolean}
     */
    static isColour(colour) {
        return Object.keys(this.TEXT_COLOUR).includes(colour.toLowerCase());
    }

    /**
     * Checks if a given style is valid based on the defined style codes.
     * @param {string} style
     * @returns {boolean}
     */
    static isStyle(style) {
        return Object.keys(this.TEXT_FORMAT).includes(style.toLowerCase());
    }

    /**
     * Clears the console using ANSI escape sequences.
     */
    static clear() {
        process.stdout.write('\x1B[2J\x1B[3J\x1B[H\x1Bc');
    }

    /**
     * Applies colour and optional styles to a string.
     *
     * @param {string} text - The text to format.
     * @param {string} colour - A supported colour (optional).
     * @param {string[]} styles - An array of supported styles (optional).
     * @returns {string} Formatted text string.
     */
    static colourise(text, colour = '', styles = []) {
        const colourCode = colour && this.isColour(colour) ? this.TEXT_COLOUR[colour.toLowerCase()] : '';
        const styleCodes = (styles || []).map((style) =>
            this.isStyle(style) ? this.TEXT_FORMAT[style.toLowerCase()] : ''
        ).join('');

        return `${colourCode}${styleCodes}${text}${this.RESET}`;
    }

    /**
     * Prints the FlyDreamAir credits to the console.
     * Optionally clears the screen first.
     *
     * @param {boolean} clear - Whether to clear the screen before printing.
     */
    static async printCredits(clear) {
        clear && this.clear();

        // Generate ASCII art banner using figlet
        const logo = await new Promise((resolve, reject) => {
            figlet('FlyDreamAir', (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });

        // Compose and style the credits section
        const credits = this.colourise(
            '    === ' +
            `${this.colourise('FlyDreamAir Testing', 'blue')}` +
            `${this.colourise(' ===', 'yellow')}\n` +
            `${this.colourise('  === Made by ', 'yellow')}` +
            `${this.colourise('Gabriel Esposito ===', 'yellow')}`,
            'yellow'
        );

        // Print everything to the console
        console.log(`${this.colourise(logo, 'blue')} \n ${credits} \n`);
    }
}