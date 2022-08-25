import { Injectable, ScopeEnum } from "@artus/injection";

export interface RedisConfig {
  clientName: string
}

@Injectable({
  id: 'ARTUS_REDIS',
  scope: ScopeEnum.SINGLETON,
})
export default class Client {
  private clientName = '';

  async init(config: RedisConfig) {
    this.clientName = config.clientName;
  }

  async getClient(): Promise<string> {
    return this.clientName;
  }
}