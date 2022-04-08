import path from 'path';
import { ArtusApplication } from '../../../src';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../src/decorator';
import { Context, Input } from '@artus/pipeline';
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

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

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
  const app: ArtusApplication = new ArtusApplication();
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
