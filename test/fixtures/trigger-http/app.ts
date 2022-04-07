import path from 'path';
import { Server } from 'http';
import { Inject, Injectable } from '@artus/injection';
import { ArtusApplication, ArtusInjectEnum } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';
import HttpTrigger from './httpTrigger';
import http from 'http';
import { Context, Input } from '@artus/pipeline';
import { ApplicationLifecycle } from '../../../src/types';

let server: Server;

@Injectable()
export class ApplicationHookExtension implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Trigger)
  // @ts-ignore
  trigger: HttpTrigger;

  @ApplicationHook()
  async didLoad() {
    this.trigger.use(async (ctx: Context) => {
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
        await this.trigger.startPipeline(input);
      })
      .listen(3001)
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}

async function main() {
  const app: ArtusApplication = new ArtusApplication({
    hookClass: ApplicationHookExtension
  });
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
