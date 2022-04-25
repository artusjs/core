import { Server } from 'http';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { ArtusApplication } from '../../../../../../../src';
import Client, { MysqlConfig } from './client';

export let server: Server;

@ApplicationExtension()
export default class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @ApplicationHook()
  async willReady() {
    const mysql = this.app.getContainer().get('ARTUS_MYSQL') as Client;
    await mysql.init(this.app.config as MysqlConfig);
  }
}
