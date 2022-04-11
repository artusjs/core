import 'reflect-metadata';
import assert from 'assert';

describe('test/trigger/event.test.ts', () => {
  it('[trigger with event] should run succeed', async () => {
    const {
      main,
      pub
    } = await import('../fixtures/trigger/event/app');
    const app = await main();
    let e1Result, e2Result;
    pub('e1', {
      cb(res) {
        e1Result = res;
      }
    });
    pub('e2', {
      cb(res) {
        e2Result = res;
      }
    });
    // wait for event handle
    await new Promise(resolve => setTimeout(resolve, 1000));
    assert(e1Result === '1e');
    assert(e2Result === '2e');
    await app.close();
  });
});
