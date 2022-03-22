import { Server } from 'http';
import { Inject } from '@artus/injection';
import { artusContainer, ArtusApplication, getArtusApplication } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';
import { HttpTrigger } from './httpTrigger';
import http from 'http';
import { Context, Input } from '@artus/pipeline';

artusContainer.set({ type: HttpTrigger });
let server: Server;

@ApplicationHookClass()
export class ApplicationHookExtension {
  @Inject(ArtusApplication)
  // @ts-ignore
  app: ArtusApplication;

  @ApplicationHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context) => {
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
        await this.app.trigger.startPipeline(input);
      })
      .listen(3001)
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}

async function main() {
  const app: ArtusApplication = getArtusApplication();
  await app.load({
    rootDir: __dirname,
    items: []
  });
  await app.run();
};

const isListening = () => server.listening;

export {
  main,
  isListening
};
