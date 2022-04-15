import { Stream } from 'stream';
import { Context, Next } from '@artus/pipeline';
import { Trigger } from '../../../../src';
import { DefineTrigger } from '../../../../src/decorator';

@DefineTrigger()
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
    const { res } = ctx.input.params;
    const { data } = ctx.output;

    res.status = data.status || 200;
    const { content } = data;

    if (Buffer.isBuffer(content) || typeof content === 'string') {
      return res.end(content);
    }

    if (content instanceof Stream) {
      return content.pipe(res);
    }

    return res.end(JSON.stringify(content));
  }
}
