import { Inject, Injectable } from '@artus/injection';
import { ArtusApplication, ArtusInjectEnum } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';
import { Context, Input, Next } from '@artus/pipeline';
import { EventTrigger } from './eventTrigger';
import { EventEmitter } from 'events';
import { ApplicationLifecycle } from '../../../src/types';

let event = new EventEmitter();

@Injectable()
export class ApplicationHookExtension implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Trigger)
  // @ts-ignore
  trigger: EventTrigger;

  @ApplicationHook()
  async didLoad() {
    this.trigger.use(async (ctx: Context, next: Next) => {
      const { input: { params: { type, payload } } } = ctx;
      if (type !== 'e1') {
        return await next();
      }
      const { output: { data } } = ctx;
      data.type = Array.from(type).reverse().join('');
      data.payload = payload;
    });

    this.trigger.use(async (ctx: Context, next: Next) => {
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
      await this.trigger.startPipeline(input);
    });

    event.on('e2', async payload => {
      const input = new Input();
      input.params.type = 'e2';
      input.params.payload = payload;
      await this.trigger.startPipeline(input);
    });
  }

  @ApplicationHook()
  beforeClose() {
    event.removeAllListeners();
  }
}

async function main() {
  const app: ArtusApplication = new ArtusApplication({
    trigger: EventTrigger,
    hookClass: ApplicationHookExtension
  });
  await app.load({
    rootDir: __dirname,
    items: []
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
