import { DefaultContext } from 'koa';
import { Server } from 'http';
import { Context, Input } from '@artus/pipeline';

import { ArtusApplication } from '../../../../src';
import { ApplicationExtension, ApplicationHook } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

import KoaApplication from './koaApp';
import TestController from './controllers/test';
import { Container } from '@artus/injection';

export let server: Server;

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;
  container: Container;

  constructor(app: ArtusApplication, container: Container) {
    this.app = app;
    this.container = container;
  }

  @ApplicationHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context) => {
      ctx.output.data = await this.container.get(TestController).index();
    });
  }

  @ApplicationHook()
  willReady() {
    const koaApp: KoaApplication = this.container.get(KoaApplication);
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
