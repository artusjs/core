import http, { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { Input } from '@artus/pipeline';
import { ArtusApplication, Inject, ArtusInjectEnum } from '../../../../../../../src';
import { HttpTrigger } from '../../../../abstract/foo';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;
  @Inject()
  trigger: HttpTrigger;

  @LifecycleHook()
  willReady() {
    const config = this.app.config ?? {};
    const port = config.port;
    server = http
      .createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const input = new Input();
        input.params = { req, res, config, app: this.app };
        const ctx = await this.trigger.initContext(input);
        await this.trigger.startPipeline(ctx);
      })
      .listen(port);
  }

  @LifecycleHook()
  beforeClose() {
    server?.close();
  }
}
