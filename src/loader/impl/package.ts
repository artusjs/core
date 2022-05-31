import { Container } from '@artus/injection';
import ConfigurationHandler from '../../configuration';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderCheckOptions } from '../types';
import compatibleRequire from '../../utils/compatible_require';
import { PACKAGE_JSON } from '../../constant';
import { isMatch } from '../../utils';

@DefineLoader('package-json')
class PackageLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  static async is(opts: LoaderCheckOptions) {
    return isMatch(opts.filename, PACKAGE_JSON);
  }

  async load(item: ManifestItem) {
    const originConfigObj = await compatibleRequire(item.path);
    const configHandler = this.container.get(ConfigurationHandler);
    configHandler.addPackage(item.source || 'app', originConfigObj);
  }
}

export default PackageLoader;
