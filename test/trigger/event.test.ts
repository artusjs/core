import 'reflect-metadata';
import assert from 'assert';
import { getArtusApplication } from '../../src';

describe('test/trigger/timer.test.ts', () => {
  it('[trigger with timer] should run succeed', async () => {
    let error;
    try {
      const {
        main,
        pub
      } = await import('../fixtures/trigger-event/app');
      const app = getArtusApplication();
      await main();
      pub('e1', {
        cb(type) {
          assert(type === '1e')
        }
      });
      pub('e2', {
        cb(type) {
          assert(type === '2e')
        }
      });
      await app.close();
    } catch (err) {
      error = err;
    }
    error && console.log(error);
    assert(!error);
  });
});