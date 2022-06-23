import { EventEmitter } from 'events';
import { ArtusApplication } from '../../../../src';
import { LifecycleHookUnit, LifecycleHook, WithApplication } from '../../../../src/decorator';
import { Context, Input, Next } from '@artus/pipeline';
import { ApplicationLifecycle } from '../../../../src/types';

export let event = new EventEmitter();

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @LifecycleHook()
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

  @LifecycleHook()
  willReady() {
    event.on('e1', async payload => {
      const input = new Input();
      input.params.type = 'e1';
      input.params.payload = payload;
      const ctx = await this.app.trigger.initContext(input);
      await this.app.trigger.startPipeline(ctx);
    });

    event.on('e2', async payload => {
      const input = new Input();
      input.params.type = 'e2';
      input.params.payload = payload;
      const ctx = await this.app.trigger.initContext(input);
      await this.app.trigger.startPipeline(ctx);
    });
  }

  @LifecycleHook()
  beforeClose() {
    event.removeAllListeners();
  }
}
