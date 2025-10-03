import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export  default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputName: "junit.xml"
      }
    ]
  ],
};