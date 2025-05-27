/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    roots: ['../build/tests/public'],
    testMatch: ['**/*.test.js'],
    moduleFileExtensions: ['js', 'json']
};