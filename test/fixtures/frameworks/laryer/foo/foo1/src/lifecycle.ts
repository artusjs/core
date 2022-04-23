import { Server } from 'http';
import http from 'http';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { Input } from '@artus/pipeline';
import { ArtusApplication } from '../../../../../../../src';
import HttpTrigger, { registerController } from './trigger/http';

export let server: Server;

@ApplicationExtension()
export default class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @ApplicationHook()
  async didLoad() {
    // register controller
    registerController(this.app.trigger as HttpTrigger);
  }

  @ApplicationHook()
  willReady() {
    const config = this.app.config ?? {};
    const port = config.port;
    server = http
      .createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const input = new Input();
        input.params = { req, res, config };
        await this.app.trigger.startPipeline(input);
      })
      .listen(port);
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}
