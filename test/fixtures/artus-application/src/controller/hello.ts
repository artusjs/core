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
};
