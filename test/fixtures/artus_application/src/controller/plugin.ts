import { HttpController, HttpMethod, HTTPMethodEnum } from '../../../frameworks/bar/src';
import { Inject } from '@artus/injection';
import { WithContext } from '../../../../../src/decorator';
import { ArtusApplication } from '../../../../../src';
import { Context } from '@artus/pipeline';

@HttpController()
export default class Hello {
  @Inject('ARTUS_MYSQL')
  // @ts-ignore
  private client: any;

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/plugin-mysql'
  })
  async getMysqlClient() {
    return {
      client: await this.client.getClient()
    };
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/plugin-redis'
  })
  async getRedisClient(@WithContext() ctx: Context) {
    const app: ArtusApplication = ctx.input.params.app;
    let client;
    try {
      client = app.getContainer().get('ARTUS_REDIS');
    } catch {

    }

    const result = client ? {
      client: await client.getClient()
    } : { message: 'plugin redis not enabled' };
    return result;
  }
};
