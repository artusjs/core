import { Server } from 'http';
import { artusContainer, ArtusApplication } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';
import { HttpTrigger } from './HttpTrigger';
import http from 'http';
import { Context, Input } from '@artus/pipeline';

artusContainer.set({ type: HttpTrigger });
const app = artusContainer.get(ArtusApplication);
let server: Server;

export class ApplicationHookExtension {
  @ApplicationHook(app)
  async didLoad() {
    app.trigger.use((ctx: Context) => {
      const { res } = ctx.input.params;
      res.status = 200;
      res.end('Hello Artus');
    });
  }

  @ApplicationHook(app)
  willReady() {
    server = http
      .createServer(async (req, res) => {
        const input = new Input();
        input.params = { req, res };
        await app.trigger.init(input);
        await app.trigger.startPipeline();
      })
      .listen(3001)
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
