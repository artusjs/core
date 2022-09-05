import { Context, Next } from '@artus/pipeline';
import { Injectable, ScopeEnum, Trigger } from '../../../../src';

@Injectable({ id: ScopeEnum.SINGLETON })
export default class HttpTrigger extends Trigger {
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
    for (const [k, v] of Object.entries(data.headers)) {
      koaCtx.set(k, v);
    }
  }
}
