import puppeteer from 'puppeteer';
import fs from 'fs';

const [,, inputHtmlPath, outputPdfPath] = process.argv;

if (!inputHtmlPath || !outputPdfPath) {
    console.error('Usage: node generate-pdf-report.js <input-html-path> <output-pdf-path>');
    process.exit(1);
}

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlContent = fs.readFileSync(inputHtmlPath, 'utf8');
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        await page.pdf({
            path: outputPdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
        });

        await browser.close();
        fs.rmSync(inputHtmlPath, { recursive: true });
        console.log(`PDF generated successfully at ${outputPdfPath}`);
    } catch (err) {
        console.error('Error generating PDF:', err);
        process.exit(1);
    }
})();