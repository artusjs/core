import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook } from '../../../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../../../src/types';
import { ArtusApplication, Inject, ArtusInjectEnum } from '../../../../../../../src';
import Client, { RedisConfig } from './client';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @LifecycleHook()
  async willReady() {
    const redis = this.app.container.get('ARTUS_REDIS') as Client;
    await redis.init(this.app.config.redis as RedisConfig);
  }
}
