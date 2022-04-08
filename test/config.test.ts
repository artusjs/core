import 'reflect-metadata';
import { ARTUS_SERVER_ENV } from '../src/constraints';

describe('test/app.test.ts', () => {
  describe('app with config', () => {
    it('should config load on application', async () => {
      process.env[ARTUS_SERVER_ENV] = 'production'
      const { main } = await import('./fixtures/app-with-config/app');
      const app = await main();
      expect(app.config).toEqual({ name: 'test-for-config', test: 1, arr: [ 4, 5, 6 ] })
    });
  });
});
