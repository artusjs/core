import { DefaultContext } from 'koa';
import { Server } from 'http';
import { Container } from '@artus/injection';
import { Context, Input } from '@artus/pipeline';

import { ArtusApplication } from '../../../../src';
import { ApplicationExtension, ApplicationHook, WithApplication, WithContainer } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

import KoaApplication from './koaApp';
import TestController from './controllers/test';

export let server: Server;

@ApplicationExtension()
export class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;
  container: Container;

  constructor(@WithApplication() app: ArtusApplication, @WithContainer() container: Container) {
    this.app = app;
    this.container = container;
  }

  get koaApp(): KoaApplication {
    return this.container.get(KoaApplication);
  }

  @ApplicationHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context) => {
      ctx.output.data = await this.container.get(TestController).index();
    });
  }

  @ApplicationHook('willReady')
  setKoaMiddleware() {
    this.koaApp.use(async (koaCtx: DefaultContext) => {
      const input = new Input();
      const { req, res } = koaCtx;
      input.params = { koaCtx, req, res };
      await this.app.trigger.startPipeline(input);
    });
  }

  @ApplicationHook('willReady')
  startKoaServer() {
    server = this.koaApp.listen(3000);
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}
