import { Injectable } from "@artus/injection";

export interface MysqlConfig {
  clientName: string
}

@Injectable({
  id: 'ARTUS_MYSQL'
})
export default class Client {
  private clientName: string = '';

  async init(config: MysqlConfig) {
    this.clientName = config.clientName;
  }

  async getClient(): Promise<string> {
    return this.clientName;
  }
};