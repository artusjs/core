import { Context } from '@artus/pipeline';
import { HttpController, HttpMethod, HTTPMethodEnum } from '../../../frameworks/foo/src/trigger/http';
import { WithContext } from '../../../../../src/decorator';

@HttpController()
export default class Hello {
  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/config'
  })
  async index(@WithContext() ctx: Context) {
    const { params: { config } } = ctx.input;
    return {
      message: `get conifg succeed`,
      config
    };
  }
};
