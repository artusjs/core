import { HttpController, HttpMethod, HTTPMethodEnum } from '../../../frameworks/bar/src';
import { Inject } from '@artus/injection';
import { ArtusApplication } from '../../../../../src';
import { Context } from '@artus/pipeline';

@HttpController()
export default class Hello {
  @Inject('ARTUS_MYSQL')
  private client: any;
  @Inject('ARTUS_HBASE')
  private client2: any;

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/plugin-mysql',
  })
  async getMysqlClient() {
    return {
      client: await this.client.getClient(),
    };
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/plugin-redis',
  })
  async getRedisClient(ctx: Context) {
    const app: ArtusApplication = ctx.input.params.app;
    let client;
    try {
      client = app.container.get('ARTUS_REDIS');
    } catch {

    }

    const result = client ? {
      client: await client.getClient(),
    } : { message: 'plugin redis not enabled' };
    return result;
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/plugin-hbase',
  })
  async getHbaseClient() {
    return {
      client: await this.client2.getClient(),
    };
  }
}
