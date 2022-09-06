import { ArtusApplication, Inject, ArtusInjectEnum } from '../../../../src';
import { LifecycleHookUnit, LifecycleHook } from '../../../../src/decorator';
import { Context, Input } from '@artus/pipeline';
import { ApplicationLifecycle } from '../../../../src/types';
import TimerTrigger from './timer_trigger';

const timers: any[] = [];
export const execution = {
  task1: {
    count: 0,
    cost: 0,
  },
  task2: {
    count: 0,
    cost: 0,
  },
};

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;
  @Inject()
  trigger: TimerTrigger;

  @LifecycleHook()
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

  @LifecycleHook()
  willReady() {
    timers.push(setInterval(async () => {
      const input = new Input();
      input.params = { task: '1', execution };
      const ctx = await this.trigger.initContext(input);
      await this.trigger.startPipeline(ctx);
    }, 100));

    timers.push(setInterval(async () => {
      const input = new Input();
      input.params = { task: '2', execution };
      const ctx = await this.trigger.initContext(input);
      await this.trigger.startPipeline(ctx);
    }, 200));
  }

  @LifecycleHook()
  beforeClose() {
    timers.forEach(clearInterval);
  }
}
