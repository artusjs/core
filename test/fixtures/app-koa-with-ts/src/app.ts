import { DefaultContext } from 'koa';
import { Server } from 'http';
import { Inject, Injectable } from '@artus/injection';
import { Context, Input } from '@artus/pipeline';

import { ArtusApplication, ArtusInjectEnum } from '../../../../src';
import { ApplicationHook } from '../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../src/types';

import KoaApplication from './koaApp';
import TestController from './controllers/test';
import HttpTrigger from './httpTrigger';

export let server: Server;

@Injectable()
export class ApplicationHookExtension implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  // @ts-ignore
  app: ArtusApplication;

  @Inject(ArtusInjectEnum.Trigger)
  // @ts-ignore
  trigger: HttpTrigger;

  @Inject(KoaApplication)
  // @ts-ignore
  koaApp: KoaApplication;

  @ApplicationHook()
  async didLoad() {
    this.trigger.use(async (ctx: Context) => {
      ctx.output.data = await this.app.get(TestController).index();
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
