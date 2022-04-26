import { Server } from 'http';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { ArtusApplication } from '../../../../../../../src';
import Client, { RedisConfig } from './client';

export let server: Server;

@ApplicationExtension()
export default class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @ApplicationHook()
  async willReady() {
    const redis = this.app.getContainer().get('ARTUS_REDIS') as Client;
    await redis.init(this.app.config.redis as RedisConfig);
  }
}
