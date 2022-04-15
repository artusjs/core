import { Server } from 'http';
import Koa from 'koa';
import { ApplicationExtension, ApplicationHook } from '../../../src/decorator';
import { ApplicationLifecycle } from '../../../src/types';

let server: Server;
const koaApp = new Koa();

@ApplicationExtension()
export default class ApplicationHookExtension implements ApplicationLifecycle {
  testStr: string = 'Hello Artus';

  @ApplicationHook()
  willReady() {
    koaApp.use((ctx) => {
      ctx.status = 200;
      ctx.body = this.testStr;
    });
    server = koaApp.listen(3000);
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}
