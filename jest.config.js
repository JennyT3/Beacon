
// jest.config.js
module.exports = {
  preset: 'ts-jest',                // usa ts-jest per TS/TSX
  testEnvironment: 'jsdom',         // simula il browser
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',   // trasforma .ts/.tsx con ts-jest
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // per jest-dom
  testMatch: [
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
};
