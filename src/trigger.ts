import { Injectable, ScopeEnum } from "@artus/injection";
import { Input, Context, MiddlewareInput, Pipeline } from "@artus/pipeline";
import { ARTUS_TRIGGER_ID } from "./constraints";

@Injectable({
  id: ARTUS_TRIGGER_ID,
  scope: ScopeEnum.SINGLETON
})
export class Trigger {
  private pipeline: Pipeline;

  constructor() {
    this.pipeline = new Pipeline();
  }

  async use(middleware: MiddlewareInput): Promise<void> {
    // TODO: async hook before pipeline.use(middleware)
    this.pipeline.use(middleware);
  }

  async initContext(input: Input): Promise<Context> {
    return new Context(input);
  }

  async startPipeline(input: Input = new Input()): Promise<Context> {
    const ctx = await this.initContext(input);
    await this.pipeline.run(ctx);
    return ctx;
  }
}
