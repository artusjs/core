import path from 'path';
import { Inject, Injectable } from '@artus/injection';
import { ArtusApplication, ArtusInjectEnum } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';
import { Context, Input } from '@artus/pipeline';
import TimerTrigger from './timerTrigger';
import { ApplicationLifecycle } from '../../../src/types';

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

@Injectable()
export class ApplicationHookExtension implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Trigger)
  // @ts-ignore
  trigger: TimerTrigger;

  @ApplicationHook()
  async didLoad() {
    this.trigger.use(async (ctx: Context) => {
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
      await this.trigger.startPipeline(input);
    }, 100));

    timers.push(setInterval(async () => {
      const input = new Input();
      input.params = { task: '2', execution };
      await this.trigger.startPipeline(input);
    }, 200));
  }

  @ApplicationHook()
  beforeClose() {
    timers.forEach(clearInterval);
  }
}

async function main() {
  const app: ArtusApplication = new ArtusApplication({
    hookClass: ApplicationHookExtension
  });
  await app.load({
    rootDir: __dirname,
    items: [
      {
        loader: 'module',
        path: path.resolve(__dirname, './timerTrigger')
      }
    ]
  });
  await app.run();

  return app;
};

function getTaskExecution() {
  return execution;
}

export {
  main,
  getTaskExecution
};
