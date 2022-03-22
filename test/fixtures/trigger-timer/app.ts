import { Inject } from '@artus/injection';
import { artusContainer, ArtusApplication, getArtusApplication } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';
import { Context, Input } from '@artus/pipeline';
import { TimerTrigger } from './timerTrigger';

artusContainer.set({ type: TimerTrigger });
let timers: any[] = [];

@ApplicationHookClass()
export class ApplicationHookExtension {
  @Inject(ArtusApplication)
  // @ts-ignore
  app: ArtusApplication;

  @ApplicationHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context) => {
      const { input: { params } } = ctx;

      // task 1
      if (params.task === '1') {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // task 2
      if (params.task === '2') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  }

  @ApplicationHook()
  willReady() {
    timers.push(setInterval(async () => {
      const input = new Input();
      input.params = { task: '1' };
      await this.app.trigger.startPipeline(input);
    }, 100));

    timers.push(setInterval(async () => {
      const input = new Input();
      input.params = { task: '2' };
      await this.app.trigger.startPipeline(input);
    }, 200));
  }

  @ApplicationHook()
  beforeClose() {
    timers.forEach(clearInterval);
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

export {
  main
};
