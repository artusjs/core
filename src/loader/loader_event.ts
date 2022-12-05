import { ManifestItem } from './types';

export interface LoaderEventListener {
  before?: CallableFunction;
  after?: CallableFunction;
  idle?: CallableFunction;

  beforeEach?: (item: ManifestItem) => void;

  afterEach?: (item: ManifestItem, loadContent: any) => void;
}

export default class LoaderEventEmitter {
  private listeners: Record<string, Record<keyof LoaderEventListener, CallableFunction[]>> = {};

  addListener(eventName, listener: LoaderEventListener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = { before: [], after: [], idle: [], beforeEach: [], afterEach: [] };
    }

    if (listener.idle) {
      this.listeners[eventName].idle.push(listener.idle);
    }

    if (listener.before) {
      this.listeners[eventName].before.push(listener.before);
    }

    if (listener.after) {
      this.listeners[eventName].after.push(listener.after);
    }

    if (listener.beforeEach) {
      this.listeners[eventName].beforeEach.push(listener.beforeEach);
    }

    if (listener.afterEach) {
      this.listeners[eventName].afterEach.push(listener.afterEach);
    }
  }

  removeListener(eventName: string, stage?: keyof LoaderEventListener) {
    if (!this.listeners[eventName]) {
      return;
    }
    if (stage) {
      this.listeners[eventName][stage] = [];
      return;
    }

    delete this.listeners[eventName];
  }

  async emitIdle(eventName, ...args) {
    await this.emit(eventName, 'idle', ...args);
  }

  async emitBefore(eventName, ...args) {
    await this.emit(eventName, 'before', ...args);
  }

  async emitAfter(eventName, ...args) {
    await this.emit(eventName, 'after', ...args);
  }

  async emitBeforeEach(eventName, ...args) {
    await this.emit(eventName, 'beforeEach', ...args);
  }

  async emitAfterEach(eventName, ...args) {
    await this.emit(eventName, 'afterEach', ...args);
  }

  async emit(eventName: string, stage: string, ...args) {
    const stages = (this.listeners[eventName] ?? {})[stage];
    if (!stages || stages.length === 0) {
      return;
    }

    for (const listener of stages) {
      await listener(...args);
    }
  }
}
