import { DefaultContext } from 'koa';
import { Server } from 'http';
import { Inject } from '@artus/injection';
import { ArtusApplication, artusContainer } from '../../../src';
import { ApplicationHook, ApplicationHookClass } from '../../../src/decorator';
import { Context, Input } from '@artus/pipeline';
import KoaApplication from './koaApp';
import TestController from './controllers/test';
import { ARTUS_TRIGGER_ID } from '../../../src/constraints';
import { HttpTrigger } from './httpTrigger';

export let server: Server;

artusContainer.set({ type: KoaApplication });

@ApplicationHookClass()
export default class ApplicationHookExtension {
  @Inject(ArtusApplication)
  // @ts-ignore
  app: ArtusApplication;

  @Inject(ARTUS_TRIGGER_ID)
  // @ts-ignore
  trigger: HttpTrigger;

  @Inject(KoaApplication)
  // @ts-ignore
  koaApp: KoaApplication;

  @ApplicationHook()
  async didLoad() {
    this.trigger.use(async (ctx: Context) => {
      const testController = artusContainer.get(TestController);
      ctx.output.data = await testController.index();
    });
  }

  @ApplicationHook()
  willReady() {
    this.koaApp.use(async (koaCtx: DefaultContext) => {
      const input = new Input();
      const { req, res } = koaCtx;
      input.params = { koaCtx, req, res };
      await this.trigger.startPipeline(input);
    });
    server = this.koaApp.listen(3000);
  }

  @ApplicationHook()
  beforeClose() {
    server?.close();
  }
}
