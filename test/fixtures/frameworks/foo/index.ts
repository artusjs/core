import { Server } from 'http';
import http from 'http';
import path from 'path';
import { DefineFramework } from '../../../../src';
import { ArtusApplication } from '../../../../src';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';
import { Context, Input } from '@artus/pipeline';

let server: Server;

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
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

@DefineFramework({
  path: __dirname
})
export class FrameworkFoo extends ArtusApplication {
  async run(): Promise<void> {
    // load http trigger
    await super.load({
      rootDir: __dirname,
      items: [
        {
          loader: 'module',
          path: path.resolve(__dirname, './httpTrigger')
        }
      ]
    });

    await super.run();
  }

  isListening() {
    return server.listening;
  }
}
