import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';

describe('test/trigger/http.test.ts', () => {
  it('should run succeed', async () => {
    const {
      main,
    } = await import('./fixtures/artus-application/src/app');
    const app = await main();
    assert(app.isListening());
    const port = app.config?.port;
    assert(port === 3003);
    const testResponse = await axios.get(`http://127.0.0.1:${port}/home`);
    assert(testResponse.status === 200);
    assert(testResponse.data.title === 'Hello Artus from application');
    await app.close();
    assert(!app.isListening());
  });
});
