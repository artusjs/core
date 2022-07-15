import { Injectable } from '@artus/injection';
import Koa from 'koa';
import { Server } from 'http';

@Injectable()
export default class KoaApplication extends Koa {
  private server: Server;

  start(port: number) {
    this.server = this.listen(port);
  }

  close() {
    this.server.close();
  }

  isListening() {
    return this.server.listening;
  }
}
