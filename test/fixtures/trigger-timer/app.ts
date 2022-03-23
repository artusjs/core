import { Inject } from '@artus/injection';
import { artusContainer, ArtusApplication, getArtusApplication } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';
import { Context, Input } from '@artus/pipeline';
import { TimerTrigger } from './timerTrigger';

artusContainer.set({ type: TimerTrigger });
let timers: any[] = [];
let execution = {
  task1: {
    count: 0,
    cost: 0,
  },
  task2: {
    count: 0,
    cost: 0
  }
};

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
        params.execution.task1.count++;
      }

      // task 2
      if (params.task === '2') {
        await new Promise(resolve => setTimeout(resolve, 100));
        params.execution.task2.count++;
      }
    });
  }

  @ApplicationHook()
  willReady() {
    timers.push(setInterval(async () => {
      const input = new Input();
      input.params = { task: '1', execution };
      await this.app.trigger.startPipeline(input);
    }, 100));

    timers.push(setInterval(async () => {
      const input = new Input();
      input.params = { task: '2', execution };
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

function getTaskExecution() {
  return execution;
}

export {
  main,
  getTaskExecution
};
