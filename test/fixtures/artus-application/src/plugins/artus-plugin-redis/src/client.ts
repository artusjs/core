import { Injectable } from "@artus/injection";

export interface RedisConfig {
  name: string
}

@Injectable({
  id: 'ARTUS_REDIS'
})
export default class Client {
  private clientName: string = '';

  async init(config: RedisConfig) {
    this.clientName = config.name;
  }

  async getClient(): Promise<string> {
    return this.clientName;
  }
};