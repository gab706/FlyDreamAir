'use strict';

/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

// Extract command-line arguments: input HTML path and output PDF path
const [,, inputHtmlPath, outputPdfPath] = process.argv;

// Validate input arguments
if (!inputHtmlPath || !outputPdfPath) {
    console.error('Usage: node generate-pdf-report.js <input-html-path> <output-pdf-path>');
    process.exit(1);
}

(async () => {
    try {
        // Launch headless Chromium browser
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Load HTML content from the input file
        const htmlContent = fs.readFileSync(inputHtmlPath, 'utf8');
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Export the content to a PDF file
        await page.pdf({
            path: outputPdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
        });

        await browser.close();

        // Clean up: remove the original HTML input
        fs.rmSync(inputHtmlPath, { recursive: true });

        console.log(`PDF generated successfully at ${outputPdfPath}`);
    } catch (err) {
        console.error('Error generating PDF:', err);
        process.exit(1);
    }
})();