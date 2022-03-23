import { Injectable, ScopeEnum } from "@artus/injection";
import { Context, Next } from "@artus/pipeline";
import { Trigger } from "../../../src";
import { ARTUS_TRIGGER_ID } from "../../../src/constraints";

@Injectable({
  id: ARTUS_TRIGGER_ID,
  scope: ScopeEnum.SINGLETON
})
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
