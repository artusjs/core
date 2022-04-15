import { Server } from 'http';
import http from 'http';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';
import { Input } from '@artus/pipeline';
import { ArtusApplication } from '../../../../src';
import HttpTrigger, { registerController } from './src/trigger/http';

export let server: Server;

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
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
