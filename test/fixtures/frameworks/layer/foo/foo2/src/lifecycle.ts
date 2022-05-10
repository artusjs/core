import { Server } from 'http';
import http from 'http';
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
        await this.app.trigger.startPipeline(input);
      })
      .listen(port);
  }

  @LifecycleHook()
  beforeClose() {
    server?.close();
  }
}
