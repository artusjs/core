import { Server } from 'http';
import Koa from 'koa';
import { ArtusApplication } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';
import { ApplicationLifecycle } from '../../../src/types';

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
    rootDir: __dirname,
    items: []
  });
  await app.run();
  return app;
};

const isListening = () => server.listening;

export {
  main,
  isListening
};
