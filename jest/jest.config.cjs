/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: ['../build/tests/server'],
    testMatch: ['**/*.test.js'],
    moduleFileExtensions: ['js', 'json'],
    clearMocks: true,
    testPathIgnorePatterns: [
        '/node_modules/',
        '/build/src/public/'
    ],
    reporters: [
        "default",
        ["jest-html-reporter", {
            pageTitle: "Backend Tests Report",
            outputPath: "./reports/jest-report-backend.html",
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]
};