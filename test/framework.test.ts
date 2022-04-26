import 'reflect-metadata';
import { Scanner } from '../src/scanner';
import path from 'path';
import axios from 'axios';
import assert from 'assert';
import { ARTUS_SERVER_ENV } from '../src/constraints';

describe('test/framework.test.ts', () => {
  beforeEach(async function () {
    process.env[ARTUS_SERVER_ENV] = 'private';
  });

  afterEach(async function () {
    process.env[ARTUS_SERVER_ENV] = undefined;
  });

  it('should run succeed', async () => {
    try {
      const scanner = new Scanner({
        needWriteFile: false, extensions: ['.ts', '.js', '.json'],
        conifgDir: 'src/config'
      });
      const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/artus-application'));
      console.log('manifest', manifest);
      const { main } = await import('./fixtures/artus-application/src');
      const app = await main(manifest);
      const { path: appFrameworkPath, choose: appFrameworkChoose } = app.artus.frameworks.get('app');
      assert(appFrameworkPath);
      assert(appFrameworkChoose === 'default');
      const { path: barFrameworkPath, choose: barFrameworkChoose } = app.artus.frameworks.get(appFrameworkPath);
      assert(barFrameworkPath);
      assert(barFrameworkChoose === 'private');
      assert(app.isListening());
      const port = app.artus.config?.port;
      assert(port === 3003);
      const testResponse = await axios.get(`http://127.0.0.1:${port}/home`);
      assert(testResponse.status === 200);
      assert(testResponse.data.title === 'Hello Artus from application <private>');

      //  check config loaded succeed
      const testResponseConfig = await axios.get(`http://127.0.0.1:${port}/config`);
      assert(testResponseConfig.status === 200);
      assert(testResponseConfig.data.message === 'get conifg succeed');

      // check frameworke used as env
      const testResponseName2 = await axios.get(`http://127.0.0.1:${port}/get_name2`);
      assert(testResponseName2.data.title === 'Hello Artus [name2] from framework: foo2 [default]');
      const testResponseName3 = await axios.get(`http://127.0.0.1:${port}/get_name3`);
      assert(testResponseName3.data.title === 'Hello Artus [name3] from framework: foo2 [private]');

      // check plugin
      const testResponseName4 = await axios.get(`http://127.0.0.1:${port}/plugin-mysql`);
      console.log(1233, testResponseName4.data);

      await app.artus.close();
      assert(!app.isListening());
    } catch (err) {
      console.error(err);
    }

  });
});
