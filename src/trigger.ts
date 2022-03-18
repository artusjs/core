import { Injectable, ScopeEnum } from "@artus/injection";
import { Input, Context, MiddlewareInput, Pipeline } from "@artus/pipeline";
import { ARTUS_TRIGGER_ID } from "./constraints";

@Injectable({
  id: ARTUS_TRIGGER_ID,
  scope: ScopeEnum.SINGLETON
})
export class Trigger {
  #pipeline = new Pipeline();
  protected input: Input;

  constructor(){
    this.input = new Input();
  }

  async init(input: Input) {
    this.input = input ?? this.input;
  }

  use(middleware: MiddlewareInput) {
    this.#pipeline.use(middleware);
  }

  async initContext(): Promise<Context> {
    return new Context(this.input);
  }

  async startPipeline(): Promise<Context> {
    const ctx = await this.initContext();
    await this.#pipeline.run(ctx);
    return ctx;
  }
}
