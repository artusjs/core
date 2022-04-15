import { Injectable } from '@artus/injection';
import { ArtusStdError } from './error';
import { ExceptionItem } from './types';

@Injectable()
export default class ExceptionHandler {
  private errorCodeMap: Map<string, ExceptionItem> = new Map();

  registerCode(code: string, exceptionItem: ExceptionItem): void {
    if (this.errorCodeMap.has(code)) {
      console.warn(`[Artus-Exception] Register error-code failed, code is existed.(${code})`);
      return;
    }
    this.errorCodeMap.set(code, exceptionItem);
  }

  throw(code: string): void {
    throw new ArtusStdError(code, this.errorCodeMap);
  }

  create(code: string): ArtusStdError {
    return new ArtusStdError(code, this.errorCodeMap);
  }
}
