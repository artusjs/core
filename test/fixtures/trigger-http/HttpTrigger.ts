import { Injectable, ScopeEnum } from "@artus/injection";
import { Context } from "@artus/pipeline";
import { Trigger } from "../../../src";
import { ARTUS_TRIGGER_ID } from "../../../src/constraints";

@Injectable({
  id: ARTUS_TRIGGER_ID,
  scope: ScopeEnum.SINGLETON
})
export class HttpTrigger extends Trigger {
  async initContext(): Promise<Context> {
    return new Context(this.input);
  }
}
