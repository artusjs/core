import { Server } from 'http';
import Koa from 'koa';
import { artusContainer, ArtusApplication } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';

const app = artusContainer.get(ArtusApplication);
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
  await app.load({
    rootDir: __dirname,
    items: []
  });
  await app.run();
};

const isListening = () => server.listening;

export {
  main,
  app,
  isListening
};
