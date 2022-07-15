import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook } from '../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../src/types';
import { ArtusInjectEnum, ArtusApplication, Inject } from '../../../../../src';
import { registerController } from './/http';
import { HttpTrigger } from '../../abstract/foo';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @LifecycleHook()
  async didLoad() {
    // register controller
    registerController(this.app.trigger as HttpTrigger);
  }
}
