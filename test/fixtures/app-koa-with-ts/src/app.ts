import { DefaultContext } from 'koa';
import { Server } from 'http';
import { Context, Input } from '@artus/pipeline';

import { ArtusApplication } from '../../../../src';
import { ApplicationExtension, ApplicationHook } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

import KoaApplication from './koaApp';
import TestController from './controllers/test';

export let server: Server;

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(app: ArtusApplication) {
    this.app = app;
  }

  @ApplicationHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context) => {
      ctx.output.data = await this.app.get(TestController).index();
    });
  }

  @ApplicationHook()
  willReady() {
    const koaApp: KoaApplication = this.app.get(KoaApplication);
    koaApp.use(async (koaCtx: DefaultContext) => {
      const input = new Input();
      const { req, res } = koaCtx;
      input.params = { koaCtx, req, res };
      await this.app.trigger.startPipeline(input);
    });
    server = koaApp.listen(3000);
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}
