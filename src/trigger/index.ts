import { ExecutionContainer, Inject } from '@artus/injection';
import { Input, Context, MiddlewareInput, Pipeline, Output } from '@artus/pipeline';
import { ArtusInjectEnum } from '../constant';
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

  async initContext(input: Input, output?: Output): Promise<Context> {
    const ctx = new Context(input, output || new Output());
    ctx.container = new ExecutionContainer(ctx, this.app.getContainer())
    return ctx;
  }

  async startPipeline(input: Input = new Input(), output?: Output): Promise<Context> {
    const ctx = await (output ? this.initContext(input, output) : this.initContext(input));
    await this.pipeline.run(ctx);
    return ctx;
  }
}
