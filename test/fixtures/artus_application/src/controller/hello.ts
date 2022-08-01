import { Context } from '@artus/pipeline';
import { HttpController, HttpMethod, HTTPMethodEnum } from '../../../frameworks/bar/src';

@HttpController()
export default class Hello {
  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/home',
  })
  async index(ctx: Context) {
    const { params: { config } } = ctx.input;
    return { title: `Hello Artus ${config.name}` };
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/get_name2',
  })
  async name2(ctx: Context) {
    const { params: { config } } = ctx.input;
    return { title: `Hello Artus ${config.name2}` };
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/get_name3',
  })
  async name3(ctx: Context) {
    const { params: { config } } = ctx.input;
    return { title: `Hello Artus ${config.name3}` };
  }
}
