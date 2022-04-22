import 'reflect-metadata';
import { Scanner } from '../src/scanner';
import path from 'path';
import axios from 'axios';
import assert from 'assert';

describe('test/framework.test.ts', () => {
  it('should run succeed', async () => {
    const scanner = new Scanner({
      needWriteFile: false, extensions: ['.ts', '.js', '.json'],
      conifgDir: 'src/config'
    });
    const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/artus-application'));
    // console.log('manifest', manifest);
    const { main } = await import('./fixtures/artus-application/src');
    const app = await main(manifest);
    assert(app.frameworks.get('app').length === 1);
    assert(app.frameworks.get('framework').length === 1);
    assert(app.packages.get('app').length === 1);
    assert(app.packages.get('framework').length === 2);
    assert(app.isListening());
    const port = app.config?.port;
    assert(port === 3003);
    const testResponse = await axios.get(`http://127.0.0.1:${port}/home`);
    assert(testResponse.status === 200);
    assert(testResponse.data.title === 'Hello Artus from application');

    // check config loaded succeed
    const testResponseConfig = await axios.get(`http://127.0.0.1:${port}/config`);
    assert(testResponseConfig.status === 200);
    assert(testResponseConfig.data.message === 'get conifg succeed');

    await app.close();
    assert(!app.isListening());

  });
});
