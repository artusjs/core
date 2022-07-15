import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { ArtusApplication, Inject, ArtusInjectEnum } from '../../../../../../../src';
import Client, { MysqlConfig } from './client';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @LifecycleHook()
  async willReady() {
    const mysql = this.app.container.get('ARTUS_MYSQL') as Client;
    await mysql.init(this.app.config.mysql as MysqlConfig);
  }
}
