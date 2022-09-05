import { Context, Next } from '@artus/pipeline';
import { Injectable, ScopeEnum, Trigger } from '../../../../src';

@Injectable({ scope: ScopeEnum.SINGLETON })
export default class TimerTrigger extends Trigger {
  constructor() {
    super();
    // first of all
    this.use(async (ctx: Context, next: Next) => {
      const start = Date.now();
      await next();
      const cost = Date.now() - start;
      const { input: { params: { task: id, execution } } } = ctx;
      execution[`task${id}`].cost += cost;
    });
  }
}
