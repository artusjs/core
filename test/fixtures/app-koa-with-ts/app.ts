import { Server } from 'http';
import Koa from 'koa';
import { artusContainer, ArtusApplication } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';

const app = artusContainer.get(ArtusApplication);
let server: Server;
const koaApp = new Koa();

koaApp.use((ctx) => {
  ctx.status = 200;
  ctx.body = 'Hello Artus';
});

export class ApplicationHookExtension {
  @ApplicationHook(app)
  willReady() {
    server = koaApp.listen(3000);
  }

  @ApplicationHook(app)
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
