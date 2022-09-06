import { Trigger } from '../../../../../src';

export interface AbstractFoo {
  isListening: () => boolean
}

export class HttpTrigger extends Trigger { }