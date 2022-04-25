import { Injectable } from "@artus/injection";

export interface MysqlConfig {
  name: string
}

@Injectable({
  id: 'ARTUS_MYSQL'
})
export default class Client {
  private clientName: string = '';

  async init(config: MysqlConfig) {
    this.clientName = config.name;
  }

  async getClient(): Promise<string> {
    return this.clientName;
  }
};