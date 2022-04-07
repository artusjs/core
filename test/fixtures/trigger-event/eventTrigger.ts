import { Context, Next } from '@artus/pipeline';
import { Trigger } from '../../../src';
import { DefineTrigger } from '../../../src/decorator';

@DefineTrigger()
export class EventTrigger extends Trigger {
  constructor() {
    super();
    // first of all
    this.use(async (ctx: Context, next: Next) => {
      await next();
      await this.respond(ctx)
    });
  }

  async respond(ctx: Context) {
    const { output: { data: { type, payload } } } = ctx;
    payload.cb(type);
  }
}
