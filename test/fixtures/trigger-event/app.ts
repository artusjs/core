import { Inject } from '@artus/injection';
import { artusContainer, ArtusApplication, getArtusApplication } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';
import { Context, Input, Next } from '@artus/pipeline';
import { EventTrigger } from './eventTrigger';
import { EventEmitter } from 'events';

artusContainer.set({ type: EventTrigger });
let event = new EventEmitter();

@ApplicationHookClass()
export class ApplicationHookExtension {
  @Inject(ArtusApplication)
  // @ts-ignore
  app: ArtusApplication;

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
  const app: ArtusApplication = getArtusApplication();
  await app.load({
    rootDir: __dirname,
    items: []
  });
  await app.run();
};

function pub(e: 'e1' | 'e2', p: any) {
  event.emit(e, p);
}

export {
  main,
  pub
};
