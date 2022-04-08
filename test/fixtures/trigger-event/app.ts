import  path from 'path';
import { EventEmitter } from 'events';
import { ArtusApplication } from '../../../src';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../src/decorator';
import { Context, Input, Next } from '@artus/pipeline';
import { ApplicationLifecycle } from '../../../src/types';

let event = new EventEmitter();

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @ApplicationHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context, next: Next) => {
      const { input: { params: { type, payload } } } = ctx;
      if (type !== 'e1') {
        return await next();
      }
      const { output: { data } } = ctx;
      data.type = Array.from(type).reverse().join('');
      data.payload = payload;
    });

    this.app.trigger.use(async (ctx: Context, next: Next) => {
      const { input: { params: { type, payload } } } = ctx;
      if (type !== 'e2') {
        return await next();
      }
      const { output: { data } } = ctx;
      data.type = Array.from(type).reverse().join('');
      data.payload = payload;
    });
  }

  @ApplicationHook()
  willReady() {
    event.on('e1', async payload => {
      const input = new Input();
      input.params.type = 'e1';
      input.params.payload = payload;
      await this.app.trigger.startPipeline(input);
    });

    event.on('e2', async payload => {
      const input = new Input();
      input.params.type = 'e2';
      input.params.payload = payload;
      await this.app.trigger.startPipeline(input);
    });
  }

  @ApplicationHook()
  beforeClose() {
    event.removeAllListeners();
  }
}

async function main() {
  const app: ArtusApplication = new ArtusApplication();
  await app.load({
    rootDir: __dirname,
    items: [
      {
        loader: 'module',
        path: path.resolve(__dirname, './eventTrigger')
      }
    ]
  });
  await app.run();

  return app;
};

function pub(e: 'e1' | 'e2', p: any) {
  event.emit(e, p);
}

export {
  main,
  pub
};
