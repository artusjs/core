import 'reflect-metadata';
import axios from 'axios';
import assert from 'assert';

describe('test/trigger/http.test.ts', () => {
  it('should run succeed', async () => {
    const {
      main,
      isListening
    } = await import('../fixtures/trigger/http/app');
    const app = await main();
    const testResponse = await axios.get('http://127.0.0.1:3001');
    await axios.get('http://127.0.0.1:3001');
    await axios.get('http://127.0.0.1:3001');
    await axios.get('http://127.0.0.1:3001');
    assert(testResponse.status === 200);
    assert(testResponse.data.title === 'Hello Artus');
    await app.close();
    assert(!isListening());
  });
});
