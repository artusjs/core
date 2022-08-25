import { Injectable, ScopeEnum } from "@artus/injection";

export interface MysqlConfig {
  clientName: string
}

@Injectable({
  id: 'ARTUS_MYSQL',
  scope: ScopeEnum.SINGLETON,
})
export default class Client {
  private clientName = '';

  async init(config: MysqlConfig) {
    this.clientName = config.clientName;
  }

  async getClient(): Promise<string> {
    return this.clientName;
  }
}