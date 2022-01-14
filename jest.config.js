module.exports = {
  verbose: true,
  moduleFileExtensions: ['js'],
  collectCoverageFrom: [
    '**/*.js',
    '!*.config.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/app.js',
    '/config/app.js',
    '/lib/logger.js',
    '/lib/server.js',
    '/test/'
  ],
  coverageReporters: [
    'json-summary',
    'json',
    'lcov',
    'text',
    'clover'
  ]
}
