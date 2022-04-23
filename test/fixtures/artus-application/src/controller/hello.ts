import { Context } from '@artus/pipeline';
import { HttpController, HttpMethod, HTTPMethodEnum } from '../../../frameworks/bar/src';
import { WithContext } from '../../../../../src/decorator';

@HttpController()
export default class Hello {
  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/home'
  })
  async index(@WithContext() ctx: Context) {
    const { params: { config } } = ctx.input;
    return { title: `Hello Artus ${config.name}` };
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/get_name2'
  })
  async name2(@WithContext() ctx: Context) {
    const { params: { config } } = ctx.input;
    return { title: `Hello Artus ${config.name2}` };
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/get_name3'
  })
  async name3(@WithContext() ctx: Context) {
    const { params: { config } } = ctx.input;
    return { title: `Hello Artus ${config.name3}` };
  }
};
