import { Server } from 'http';
import { ApplicationExtension, ApplicationHook, WithApplication } from '../../../../../src/decorator';
import { ApplicationLifecycle } from '../../../../../src/types';
import { ArtusApplication } from '../../../../../src';
import { registerController } from './/http';
import { HttpTrigger } from '../../abstract/foo';

export let server: Server;

@ApplicationExtension()
export default class ApplicationHookExtension implements ApplicationLifecycle {
  app: ArtusApplication;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
  }

  @ApplicationHook()
  async didLoad() {
    // register controller
    registerController(this.app.trigger as HttpTrigger);
  }
}
