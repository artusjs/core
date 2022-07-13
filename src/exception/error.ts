import { ARTUS_EXCEPTION_DEFAULT_LOCALE } from '../constant';
import { ExceptionItem } from './types';

export const ErrorCodeUtils = {
  getI18NDesc (codeMap: Map<string, ExceptionItem>, code: string, locale?: string) {
    const currentLocale = locale || process.env.ARTUS_ERROR_LOCALE || ARTUS_EXCEPTION_DEFAULT_LOCALE;
    const exceptionItem = codeMap.get(code);
    if (!exceptionItem) {
      return 'Unknown Error';
    }
    if (typeof exceptionItem.desc === 'string') {
      return exceptionItem.desc;
    }
    return exceptionItem.desc[currentLocale];
  },
};

export class ArtusStdError extends Error {
  name = 'ArtusStdError';
  private _code: string;
  private _codeMap: Map<string, ExceptionItem>;
  
  constructor (code: string, codeMap: Map<string, ExceptionItem>) {
    super(`[${code}] This is Artus standard error, Please check on https://github.com/artusjs/error-code`);
    this._code = code;
    this._codeMap = codeMap;
  }
  
  get code(): string {
    return this._code;
  }
  
  get desc(): string {
    // TODO: 待支持从 Config 获取 I18N 的 Locale
    return ErrorCodeUtils.getI18NDesc(this._codeMap, this._code);
  }
  
  get detailUrl(): string|undefined {
    return this._codeMap.get(this._code)?.detailUrl;
  }
}