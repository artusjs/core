import 'reflect-metadata';

describe('test/trigger/http.test.ts', () => {
  it('should run succeed', async () => {
    const {
      main,
    } = await import('./fixtures/artus-application/app');
    const app = await main();
    console.log(12333, app);
  });
});
