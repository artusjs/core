import { DefineLoader } from '../decorator';
import { ManifestItem, Loader, LoaderFindOptions } from '../types';
import { ExceptionItem } from '../../exception/types';
import { loadMetaFile } from '../../utils/load_meta_file';
import { EXCEPTION_FILENAME } from '../../constant';
import { isMatch } from '../../utils';
import { ArtusStdError } from '../../exception';

@DefineLoader('exception')
class ExceptionLoader implements Loader {
  static async is(opts: LoaderFindOptions) {
    return isMatch(opts.filename, EXCEPTION_FILENAME);
  }

  async load(item: ManifestItem) {
    try {
      const codeMap: Record<string, ExceptionItem> = await loadMetaFile<
      Record<string, ExceptionItem>
      >(item.path);
      for (const [errCode, exceptionItem] of Object.entries(codeMap)) {
        ArtusStdError.registerCode(errCode, exceptionItem);
      }
      return codeMap;
    } catch (error) {
      console.warn(`[Artus-Exception] Parse CodeMap ${item.path} failed: ${error.message}`);
      return void 0;
    }
  }
}

export default ExceptionLoader;
