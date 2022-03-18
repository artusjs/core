import { Server } from 'http';
import { artusContainer, ArtusApplication } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';
import { HttpTrigger } from './httpTrigger';
import http from 'http';
import { Context, Input } from '@artus/pipeline';

artusContainer.set({ type: HttpTrigger });
const app: ArtusApplication = artusContainer.get(ArtusApplication);
let server: Server;

@ApplicationHookClass()
export class ApplicationHookExtension {
  @ApplicationHook()
  async didLoad() {
    app.trigger.use(async (ctx: Context) => {
      const { data } = ctx.output;
      data.content = { title: 'Hello Artus' };
    });
  }

  @ApplicationHook()
  willReady() {
    server = http
      .createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const input = new Input();
        input.params = { req, res };
        await app.trigger.init(input);
        await app.trigger.startPipeline();
      })
      .listen(3001)
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
