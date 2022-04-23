import { Trigger } from '../../../../../src';

export interface AbstractFoo {
  isListening: () => boolean
}

export interface HttpTrigger extends Trigger {}