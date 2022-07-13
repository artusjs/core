import http, { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook, WithApplication } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { Input } from '@artus/pipeline';
import { ArtusApplication } from '../../../../../../../src';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @LifecycleHook()
  willReady() {
    const config = this.app.config ?? {};
    const port = config.port;
    server = http
      .createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const input = new Input();
        input.params = { req, res, config, app: this.app };
        const ctx = await this.app.trigger.initContext(input);
        await this.app.trigger.startPipeline(ctx);
      })
      .listen(port);
  }

  @LifecycleHook()
  beforeClose() {
    server?.close();
  }
}
