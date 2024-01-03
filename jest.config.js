/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/test/fixtures/app-koa-with-ts/src/controllers'
  ],
  coverageReporters: ['json', 'json-summary', 'lcov', 'text', 'clover', 'text-summary', 'cobertura'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  transformIgnorePatterns: ["/node_modules/(?!(artus_plugin_hbase)/)", "\\.pnp\\.[^\\\/]+$"]
};
