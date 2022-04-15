import { Context } from '@artus/pipeline';
import { HttpController, HttpMethod, HTTPMethodEnum } from '../trigger/http';

@HttpController()
export default class Hello {
  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/home'
  })
  async index(ctx: Context) {
    const { data } = ctx.output;
    data.content = { title: 'Hello Artus' };
  }
};
