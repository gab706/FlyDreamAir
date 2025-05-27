/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    roots: ['../build/tests/public'],
    testMatch: ['**/*.test.js'],
    moduleFileExtensions: ['js', 'json'],
    clearMocks: true,
    setupFiles: ['<rootDir>/jest.setup.env.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    reporters: [
        "default",
        ["jest-html-reporter", {
            pageTitle: "Frontend Tests Report",
            outputPath: "./reports/jest-report-frontend.html",
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]
};