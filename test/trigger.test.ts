import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';

describe('test/trigger.test.ts', () => {
  describe('trigger with http', () => {
    it('should run succeed', async () => {
      let error;
      try {
        const {
          main,
          app,
          isListening
        } = await import('./fixtures/trigger-http/app');
        await main();
        const testResponse = await axios.get('http://127.0.0.1:3001');
        assert(testResponse.status === 200);
        assert(testResponse.data.title === 'Hello Artus');
        await app.close();
        assert(!isListening());
      } catch (err) {
        error = err;
      }
      error && console.log(error);
      assert(!error);
    });
  });
});
