import path from 'path';
import { Server } from 'http';
import Koa from 'koa';
import { ArtusApplication } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';
import { ApplicationLifecycle } from '../../../src/types';

const rootDir = path.resolve(__dirname, './');

let server: Server;
const koaApp = new Koa();

export class ApplicationHookExtension implements ApplicationLifecycle {
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
  const app = new ArtusApplication({
    hookClass: ApplicationHookExtension
  });
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
  return app;
};


export {
  main,
};
