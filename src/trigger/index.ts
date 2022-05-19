import { ExecutionContainer, Inject } from '@artus/injection';
import { Input, Context, MiddlewareInput, Pipeline, Output } from '@artus/pipeline';
import { ArtusInjectEnum } from '../constraints';
import { Application } from '../types';
import { DefineTrigger } from './decorator';

@DefineTrigger()
export default class Trigger {
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

  async initContext(input: Input): Promise<Context> {
    const ctx = new Context(input, new Output());
    ctx.container = new ExecutionContainer(ctx, this.app.getContainer())
    return ctx;
  }

  async startPipeline(input: Input = new Input()): Promise<Context> {
    const ctx = await this.initContext(input);
    await this.pipeline.run(ctx);
    return ctx;
  }
}
