export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                // ts-jest transpiles each test file to CommonJS, which is
                // incompatible with the project's `verbatimModuleSyntax`
                // (ESM-only import/export syntax). Relax it for the test
                // transform only — the production tsconfig used by `tsc`
                // is untouched.
                tsconfig: {
                    module: "CommonJS",
                    verbatimModuleSyntax: false,
                },
            },
        ],
    },
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/**/*.test.ts",
        "!src/**/*.spec.ts",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "html", "lcov"],
    moduleFileExtensions: ["ts", "js", "json"],
};
