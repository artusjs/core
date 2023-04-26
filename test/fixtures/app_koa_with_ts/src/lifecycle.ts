import { DefaultContext } from 'koa';
import { Server } from 'http';
import { Container, ExecutionContainer, Inject } from '@artus/injection';

import { ArtusApplication, ArtusInjectEnum } from '../../../../src';
import { LifecycleHookUnit, LifecycleHook } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

import KoaApplication from './koa_app';
import HelloController from './controllers/hello';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;
  @Inject()
  container: Container;

  get koaApp(): KoaApplication {
    return this.container.get(KoaApplication);
  }

  @LifecycleHook('willReady')
  setKoaMiddleware() {
    this.koaApp.use(async (koaCtx: DefaultContext) => {
      const executionContainer = new ExecutionContainer(null, this.container);
      executionContainer.set({ id: 'headers', value: koaCtx.headers });

      const data = await executionContainer.get(HelloController).index();
      koaCtx.status = data.status || 200;
      koaCtx.body = data.content;
      for (const [k, v] of Object.entries(data.headers)) {
        koaCtx.set(k, v);
      }
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
