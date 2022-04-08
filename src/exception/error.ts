import { ARTUS_EXCEPTION_DEFAULT_LOCALE } from '../constraints';
import { ExceptionItem } from './types';

export const ErrorCodeUtils = {
  getI18NDesc (code: string, locale?: string) {
    const currentLocale = locale || process.env.ARTUS_ERROR_LOCALE || ARTUS_EXCEPTION_DEFAULT_LOCALE;
    const exceptionItem = ArtusStdError.errorCodeMap.get(code);
    if (!exceptionItem) {
      return 'Unknown Error';
    }
    if (typeof exceptionItem.desc === 'string') {
      return exceptionItem.desc;
    }
    return exceptionItem.desc[currentLocale];
   }
};

export class ArtusStdError extends Error {
  static errorCodeMap: Map<string, ExceptionItem> = new Map();

  static registerCode(code: string, exceptionItem: ExceptionItem): void {
    if (this.errorCodeMap.has(code)) {
      console.log(`[Artus-Exception] Register error-code failed, code is existed.(${code})`);
      return;
    }
    this.errorCodeMap.set(code, exceptionItem);
  }

  name: string = 'ArtusStdError';
  private _code: string;
  
  constructor (code: string) {
      super(`[${code}] This is Artus standard error, Please check on https://github.com/artusjs/error-code`);
      this._code = code;
  }
  
  get code(): string {
      return this._code;
  }
  
  get desc(): string {
    // TODO: 待支持从 Config 获取 I18N 的 Locale
    return ErrorCodeUtils.getI18NDesc(this._code);
  }
  
  get detailUrl(): string|undefined {
    return ArtusStdError.errorCodeMap.get(this._code)?.detailUrl;
  }
}