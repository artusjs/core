import { Server } from 'http';
import { Inject, Injectable } from '@artus/injection';
import { ArtusApplication } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';
import { HttpTrigger } from './httpTrigger';
import http from 'http';
import { Context, Input } from '@artus/pipeline';
import { ARTUS_TRIGGER_ID } from '../../../src/constraints';
import { ApplicationLifecycle } from '../../../src/types';

let server: Server;

@Injectable()
export class ApplicationHookExtension implements ApplicationLifecycle {
  @Inject(ARTUS_TRIGGER_ID)
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
    trigger: HttpTrigger,
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
