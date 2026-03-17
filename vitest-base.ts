import { defineConfig, type UserWorkspaceConfig } from 'vitest/config';

type CreateVitestConfigOptions = {
  test?: UserWorkspaceConfig['test'];
};

const createVitestConfig = (options: CreateVitestConfigOptions = {}) =>
  defineConfig({
    root: process.cwd(),
    test: {
      globals: true,
      include: ['src/(**/)?*.test.[jt]s(x)?'],
      ...options.test,
    },
  });

export { createVitestConfig };
