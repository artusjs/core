import { Constructable } from '@artus/injection';
import { ArtusStdError } from './impl';

export interface ExceptionItem {
  desc: string | Record<string, string>;
  detailUrl?: string;
}

export type ExceptionIdentifier = string|symbol|Constructable<Error>;
export type ExceptionFilterMapType = Map<ExceptionIdentifier, Constructable<ExceptionFilterType>>;

export interface ExceptionFilterType {
  catch(err: Error|ArtusStdError): void | Promise<void>;
}
