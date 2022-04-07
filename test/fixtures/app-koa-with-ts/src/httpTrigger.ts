import { Context, Next } from '@artus/pipeline';
import { Trigger } from '../../../../src';
import { DefineTrigger } from '../../../../src/decorator';

@DefineTrigger()
export class HttpTrigger extends Trigger {
  constructor() {
    super();
    // first of all
    this.use(async (ctx: Context, next: Next) => {
      await next();
      await this.respond(ctx);
    });
  }

  async respond(ctx: Context) {
    const { koaCtx } = ctx.input.params;
    const { data } = ctx.output;

    koaCtx.status = data.status || 200;
    koaCtx.body = data.content;
  }
}
