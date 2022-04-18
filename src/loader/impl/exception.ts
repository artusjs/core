import { Container } from '@artus/injection';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import { ExceptionItem } from '../../exception/types';
import { ExceptionHandler } from '../../exception';
import { loadMetaFile } from '../../utils/load-meta-file';

@DefineLoader('exception')
class ExceptionLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const exceptionHandler = this.container.get(ExceptionHandler);
    try {
      const codeMap: Record<string, ExceptionItem> = await loadMetaFile<Record<string, ExceptionItem>>(item);
      for (const [errCode, exceptionItem] of Object.entries(codeMap)) {
        exceptionHandler.registerCode(errCode, exceptionItem);
      }
    } catch (error) {
      console.warn(`[Artus-Exception] Parse CodeMap ${item.path} failed: ${error.message}`);
    }
  }
}

export default ExceptionLoader;
