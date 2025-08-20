import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,                 // use test/expect/describe without imports
    environment: 'node',           // fastest; no DOM
    include: [
      'src/**/*.test.{ts,js}',
      'src/**/*.spec.{ts,js}',
    ],                             // co-locate next to source
    reporters: ['default'],
    bail: 0,                       // run ALL tests, even if some fail
  },
});
