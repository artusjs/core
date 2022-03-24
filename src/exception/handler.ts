import { ArtusStdError } from './error';

export class ExceptionHandler {
  throw(code: string): void {
    throw new ArtusStdError(code);
  }

  create(code: string): ArtusStdError {
    return new ArtusStdError(code);
  }
}
