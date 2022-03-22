import 'reflect-metadata';
import assert from 'assert';
import { getArtusApplication } from '../../src';

describe('test/trigger/timer.test.ts', () => {
  it('[trigger with timer] should run succeed', async () => {
    let error;
    try {
      const {
        main
      } = await import('../fixtures/trigger-timer/app');
      const app = getArtusApplication();
      await main();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await app.close();
    } catch (err) {
      error = err;
    }
    error && console.log(error);
    assert(!error);
  });
});