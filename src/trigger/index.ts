import { ExecutionContainer, Inject } from '@artus/injection';
import { Input, Context, MiddlewareInput, Pipeline, Output } from '@artus/pipeline';
import { ArtusInjectEnum } from '../constant';
import { Application, TriggerType } from '../types';
import { DefineTrigger } from './decorator';

@DefineTrigger()
export default class Trigger implements TriggerType {
  private pipeline: Pipeline;

  @Inject(ArtusInjectEnum.Application)
  // @ts-ignore
  private app: Application;

  constructor() {
    this.pipeline = new Pipeline();
  }

  async use(middleware: MiddlewareInput): Promise<void> {
    // TODO: async hook before pipeline.use(middleware)
    this.pipeline.use(middleware);
  }

  async initContext(input: Input, output: Output): Promise<Context> {
    const ctx = new Context(input, output);
    ctx.container = new ExecutionContainer(ctx, this.app.getContainer());
    return ctx;
  }

  async startPipeline(input: Input = new Input(), output = new Output()): Promise<Context> {
    const ctx = await this.initContext(input, output);
    await this.pipeline.run(ctx);
    return ctx;
  }
}
