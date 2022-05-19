import { Server } from 'http';
import Koa from 'koa';
import { LifecycleHookUnit, LifecycleHook } from '../../../src/decorator';
import { ApplicationLifecycle } from '../../../src/types';

let server: Server;
const koaApp = new Koa();

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  testStr: string = 'Hello Artus';

  @LifecycleHook()
  willReady() {
    koaApp.use((ctx) => {
      ctx.status = 200;
      ctx.body = this.testStr;
    });
    server = koaApp.listen(3000);
  }

  @LifecycleHook()
  beforeClose() {
    server?.close();
  }
}
