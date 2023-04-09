const tsconfig = require('./tsconfig.base.json')
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig)

module.exports = {
    displayName: 'all',
    preset: './jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.spec.json',
        },
    },
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(e-sign.spec).[jt]s?(x)'],
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    moduleNameMapper,
}
