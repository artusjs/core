import path from 'path';
import { Server } from 'http';
import Koa from 'koa';
import { getArtusApplication } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';

const rootDir = path.resolve(__dirname, './');

let server: Server;
const koaApp = new Koa();

@ApplicationHookClass()
export class ApplicationHookExtension {
  testStr: string = 'Hello Artus';

  @ApplicationHook()
  willReady() {
    koaApp.use((ctx) => {
      ctx.status = 200;
      ctx.body = this.testStr;
    });
    server = koaApp.listen(3000);
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}

async function main() {
  const app = getArtusApplication();
  await app.load({
    rootDir,
    items: [
      {
        loader: 'module',
        path: path.resolve(rootDir, './config/config.default.ts')
      },
      {
        loader: 'module',
        path: path.resolve(rootDir, './config/config.production.ts')
      }
    ]
  });
};


export {
  main,
};
