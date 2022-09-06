import http, { Server } from 'http';
import { Context, Input } from '@artus/pipeline';
import { ArtusApplication, Inject, ArtusInjectEnum } from '../../../../src';
import { LifecycleHookUnit, LifecycleHook } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';
import HttpTrigger from './http_trigger';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;
  @Inject()
  trigger: HttpTrigger;

  @LifecycleHook()
  async didLoad() {
    this.trigger.use(async (ctx: Context) => {
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
        const ctx = await this.trigger.initContext(input);
        await this.trigger.startPipeline(ctx);
      })
      .listen(3001);
  }

  @LifecycleHook()
  beforeClose() {
    server?.close();
  }
}
