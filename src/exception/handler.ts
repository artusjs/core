import { ArtusStdError } from './error';

export default class ExceptionHandler {
  throw(code: string): void {
    throw new ArtusStdError(code);
  }

  create(code: string): ArtusStdError {
    return new ArtusStdError(code);
  }
}
