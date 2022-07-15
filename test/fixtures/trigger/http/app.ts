import http, { Server } from 'http';
import { Context, Input } from '@artus/pipeline';
import { ArtusApplication, Inject, ArtusInjectEnum } from '../../../../src';
import { LifecycleHookUnit, LifecycleHook } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @LifecycleHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context) => {
      const { data } = ctx.output;
      data.content = { title: 'Hello Artus' };
    });
  }

  @LifecycleHook()
  willReady() {
    server = http
      .createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const input = new Input();
        input.params = { req, res };
        const ctx = await this.app.trigger.initContext(input);
        await this.app.trigger.startPipeline(ctx);
      })
      .listen(3001);
  }

  @LifecycleHook()
  beforeClose() {
    server?.close();
  }
}
