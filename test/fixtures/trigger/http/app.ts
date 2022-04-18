import http, { Server } from 'http';
import { Context, Input } from '@artus/pipeline';
import { ArtusApplication } from '../../../../src';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

export let server: Server;

@ApplicationExtension()
export default class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
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
