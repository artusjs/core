import { DefaultContext } from 'koa';
import { Server } from 'http';
import { Container } from '@artus/injection';
import { Context, Input } from '@artus/pipeline';

import { ArtusApplication } from '../../../../src';
import { LifecycleHookUnit, LifecycleHook, WithApplication, WithContainer } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

import KoaApplication from './koa_app';
import HelloController from './controllers/hello';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  app: ArtusApplication;
  container: Container;

  constructor(@WithApplication() app: ArtusApplication, @WithContainer() container: Container) {
    this.app = app;
    this.container = container;
  }

  get koaApp(): KoaApplication {
    return this.container.get(KoaApplication);
  }

  @LifecycleHook()
  async didLoad() {
    this.app.trigger.use(async (ctx: Context) => {
      const { koaCtx } = ctx.input.params;
      ctx.container.set({ id: 'headers', value: koaCtx.headers });
      ctx.output.data = await ctx.container.get(HelloController).index();
    });
  }

  @LifecycleHook('willReady')
  setKoaMiddleware() {
    this.koaApp.use(async (koaCtx: DefaultContext) => {
      const input = new Input();
      const { req, res } = koaCtx;
      input.params = { koaCtx, req, res };
      const ctx = await this.app.trigger.initContext(input);
      await this.app.trigger.startPipeline(ctx);
    });
  }

  @LifecycleHook('willReady')
  startKoaServer() {
    server = this.koaApp.listen(3000);
  }

  @LifecycleHook()
  beforeClose() {
    server?.close();
  }
}
