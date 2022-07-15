import { Inject } from '@artus/injection';
import KoaApplication from './koa_app';
import { Bootstrap, DefineBootstrap } from '../../../../src/bootstrap';

@DefineBootstrap()
export default class KoaBootstrap implements Bootstrap {
  @Inject()
  koaApp: KoaApplication;

  async run(): Promise<void> {
    this.koaApp.start(3000);
  }
}
