
import { DefineLoader, Loader, LoaderFindOptions, ManifestItem } from '../../../../../src';
import compatibleRequire from '../../../../../src/utils/compatible_require';

interface TestLoaderState {
  hello: string;
}

@DefineLoader('test-custom-loader')
export default class TestCustomLoader implements Loader {
  static async is(opts: LoaderFindOptions) {
    return opts.filename === 'test_clazz.ts';
  }

  static async onFind(_opts: LoaderFindOptions): Promise<TestLoaderState> {
    return {
      hello: 'loaderState',
    };
  }

  state!: TestLoaderState;

  async load(item: ManifestItem) {
    const clazz = await compatibleRequire(item.path);
    if (!global.mockCustomLoaderFn) {
      throw new Error('Invalid Jest Environment');
    }
    global.mockCustomLoaderFn(clazz.name);
    global.mockCustomLoaderFn(this.state.hello);
  }
}