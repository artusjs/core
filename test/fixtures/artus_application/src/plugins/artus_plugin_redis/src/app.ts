import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook, WithApplication } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { ArtusApplication } from '../../../../../../../src';
import Client, { RedisConfig } from './client';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @LifecycleHook()
  async willReady() {
    const redis = this.app.container.get('ARTUS_REDIS') as Client;
    await redis.init(this.app.config.redis as RedisConfig);
  }
}
