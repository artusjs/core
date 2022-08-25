import { Constructable, Container, InjectableDefinition, ScopeEnum } from '@artus/injection';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import compatibleRequire from '../../utils/compatible_require';
import { SHOULD_OVERWRITE_VALUE } from '../../constant';

@DefineLoader('module')
class ModuleLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem): Promise<Constructable[]> {
    const origin = await compatibleRequire(item.path, true);
    item._loaderState = Object.assign({ exportNames: ['default'] }, item._loaderState);
    const { _loaderState: state } = item as { _loaderState: { exportNames: string[] } };

    const modules: Constructable[] = [];

    for (const name of state.exportNames) {
      const moduleClazz = origin[name];
      const opts: Partial<InjectableDefinition> = {
        path: item.path,
        type: moduleClazz,
        scope: ScopeEnum.EXECUTION, // The class used with @artus/core will have default scope EXECUTION, can be overwritten by Injectable decorator
      };
      if (item.id) {
        opts.id = item.id;
      }

      const shouldOverwriteValue = Reflect.getMetadata(SHOULD_OVERWRITE_VALUE, moduleClazz);

      if (shouldOverwriteValue || !this.container.hasValue(opts)) {
        this.container.set(opts);
      }

      modules.push(moduleClazz);
    }

    return modules;
  }
}

export default ModuleLoader;
