import { Injectable, ScopeEnum } from '@artus/injection';
import Koa from 'koa';

@Injectable({
  scope: ScopeEnum.SINGLETON,
})
export default class KoaApplication extends Koa { }
