import { Injectable, ScopeEnum } from "@artus/injection";
import { Context, Next } from "@artus/pipeline";
import { Trigger } from "../../../../src";
import { ARTUS_TRIGGER_ID } from "../../../../src/constraints";

@Injectable({
  id: ARTUS_TRIGGER_ID,
  scope: ScopeEnum.SINGLETON
})
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
