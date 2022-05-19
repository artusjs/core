import { Injectable } from "@artus/injection";

export interface RedisConfig {
  clientName: string
}

@Injectable({
  id: 'ARTUS_REDIS'
})
export default class Client {
  private clientName: string = '';

  async init(config: RedisConfig) {
    this.clientName = config.clientName;
  }

  async getClient(): Promise<string> {
    return this.clientName;
  }
};