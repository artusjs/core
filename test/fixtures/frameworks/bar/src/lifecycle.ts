import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook, WithApplication } from '../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../src/types';
import { ArtusApplication } from '../../../../../src';
import { registerController } from './/http';
import { HttpTrigger } from '../../abstract/foo';

export let server: Server;

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @LifecycleHook()
  async didLoad() {
    // register controller
    registerController(this.app.trigger as HttpTrigger);
  }
}
