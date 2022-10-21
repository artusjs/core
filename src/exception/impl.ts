import { Middleware } from '@artus/pipeline';
import { ARTUS_EXCEPTION_DEFAULT_LOCALE } from '../constant';
import { ExceptionItem } from './types';
import { matchExceptionFilter } from './utils';

export const exceptionFilterMiddleware: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const filter = matchExceptionFilter(err, ctx.container);
    if (filter) {
      await filter.catch(err);
    }
    throw err;
  }
};

export class ArtusStdError extends Error {
  name = 'ArtusStdError';
  private _code: string;
  private static codeMap: Map<string, ExceptionItem> = new Map();
  private static currentLocale: string = process.env.ARTUS_ERROR_LOCALE || ARTUS_EXCEPTION_DEFAULT_LOCALE;

  public static registerCode(code: string, item: ExceptionItem) {
    this.codeMap.set(code, item);
  }

  public static setCurrentLocale(locale: string) {
    this.currentLocale = locale;
  }
  
  constructor (code: string) {
    super(`[${code}] This is Artus standard error, Please check on https://github.com/artusjs/spec/blob/master/documentation/core/6.exception.md`); // default message
    this._code = code;
    this.message = this.getFormatedMessage();
  }

  private getFormatedMessage(): string {
    const { code, desc, detailUrl } = this;
    return `[${code}] ${desc}${detailUrl ? ', Please check on ' + detailUrl : ''}`;
  }
  
  public get code(): string {
    return this._code;
  }
  
  public get desc(): string {
    const { codeMap, currentLocale } = ArtusStdError;
    const exceptionItem = codeMap.get(this._code);
    if (!exceptionItem) {
      return 'Unknown Error';
    }
    if (typeof exceptionItem.desc === 'string') {
      return exceptionItem.desc;
    }
    return exceptionItem.desc[currentLocale];
  }
  
  public get detailUrl(): string|undefined {
    return ArtusStdError.codeMap.get(this._code)?.detailUrl;
  }
}
