import { Context } from '@artus/pipeline';
import { HttpController, HttpMethod, HTTPMethodEnum } from '../../../frameworks/bar/src';

@HttpController()
export default class Hello {
  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/config',
  })
  async index(ctx: Context) {
    const { params: { config } } = ctx.input;
    return {
      message: `get config succeed`,
      config,
    };
  }
}
