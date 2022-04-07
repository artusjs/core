import path from 'path';
import { Server } from 'http';
import { ArtusApplication } from '../../../src';
import { ApplicationExtension, ApplicationHook } from '../../../src/decorator';
import http from 'http';
import { Context, Input } from '@artus/pipeline';
import { ApplicationLifecycle } from '../../../src/types';

let server: Server;

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(app: ArtusApplication) {
    this.app = app;
  }

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
  const app: ArtusApplication = new ArtusApplication();
  await app.load({
    rootDir: __dirname,
    items: [
      {
        loader: 'module',
        path: path.resolve(__dirname, './httpTrigger')
      }
    ]
  });
  await app.run();

  return app;
};

const isListening = () => server.listening;

export {
  main,
  isListening
};
