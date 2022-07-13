export interface LoaderEventListener {
  before?: CallableFunction;
  after?: CallableFunction;
}

export default class LoaderEventEmitter {
  private listeners: Record<string, Record<'before' | 'after', CallableFunction[]>> = {};

  addListener(eventName, listener: LoaderEventListener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = { before: [], after: [] };
    }

    if (listener.before) {
      this.listeners[eventName].before.push(listener.before);
    }

    if (listener.after) {
      this.listeners[eventName].after.push(listener.after);
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

  async emitBefore(eventName, ...args) {
    const { before = [] } = this.listeners[eventName] ?? {};
    if (!before || before.length === 0) {
      return;
    }
    for (const listener of before) {
      await listener(...args);
    }
  }

  async emitAfter(eventName, ...args) {
    const { after = [] } = this.listeners[eventName] ?? {};
    if (!after || after.length === 0) {
      return;
    }

    for (const listener of after) {
      await listener(...args);
    }
  }
}
