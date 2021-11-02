module.exports = {
  preset: 'ts-jest',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/lib/**', '**/src/**', '!jest.config.ts'],
  coverageDirectory: './coverage',
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/samples/'],
}
