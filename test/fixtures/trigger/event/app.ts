import { EventEmitter } from 'events';
import { ArtusApplication, Inject, ArtusInjectEnum } from '../../../../src';
import { LifecycleHookUnit, LifecycleHook } from '../../../../src/decorator';
import { Context, Input, Next } from '@artus/pipeline';
import { ApplicationLifecycle } from '../../../../src/types';
import EventTrigger from './event_trigger';

export const event = new EventEmitter();

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;
  @Inject()
  trigger: EventTrigger;

  @LifecycleHook()
  async didLoad() {
    this.trigger.use(async (ctx: Context, next: Next) => {
      const { input: { params: { type, payload } } } = ctx;
      if (type !== 'e1') {
        await next();
        return;
      }
      const { output: { data } } = ctx;
      data.type = Array.from(type).reverse().join('');
      data.payload = payload;
    });

    this.trigger.use(async (ctx: Context, next: Next) => {
      const { input: { params: { type, payload } } } = ctx;
      if (type !== 'e2') {
        await next();
        return;
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
      const ctx = await this.trigger.initContext(input);
      await this.trigger.startPipeline(ctx);
    });

    event.on('e2', async payload => {
      const input = new Input();
      input.params.type = 'e2';
      input.params.payload = payload;
      const ctx = await this.trigger.initContext(input);
      await this.trigger.startPipeline(ctx);
    });
  }

  @LifecycleHook()
  beforeClose() {
    event.removeAllListeners();
  }
}
