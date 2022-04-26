import { HttpController, HttpMethod, HTTPMethodEnum } from '../../../frameworks/bar/src';
import { Inject } from '@artus/injection';

@HttpController()
export default class Hello {
  @Inject('ARTUS_MYSQL')
  // @ts-ignore
  private client: any;

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/plugin-mysql'
  })
  async index() {
    return {
      client: await this.client.getClient()
    };
  }
};
