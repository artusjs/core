/**
 * is typeof
 */
class Is {
  string(arg: any): boolean {
    return typeof arg === 'string';
  }

  function(arg: any): boolean {
    return typeof arg === 'function';
  }

  promise(arg: any): boolean {
    return arg && 'function' === typeof arg.then;
  }

  class(arg: any): boolean {
    if (typeof arg !== 'function') {
      return false;
    }

    const fnStr = Function.prototype.toString.call(arg);

    return (
      fnStr.substring(0, 5) === 'class' ||
      Boolean(~fnStr.indexOf('classCallCheck(')) ||
      Boolean(
        ~fnStr.indexOf('TypeError("Cannot call a class as a function")')
      )
    );
  }

  object(arg: any): boolean {
    return arg !== null && typeof arg === 'object';
  }

  objectObject(o) {
    return (
      this.object(o) &&
      Object.prototype.toString.call(o) === '[object Object]'
    );
  }

  plainObject(o) {
    if (!this.objectObject(o)) {
      return false;
    }

    // If has modified constructor
    const ctor = o.constructor;
    if (typeof ctor !== 'function') {
      return false;
    }

    // If has modified prototype
    const prot = ctor.prototype;
    if (!this.objectObject(prot)) {
      return false;
    }

    // If constructor does not have an Object-specific method
    if (!prot.hasOwnProperty('isPrototypeOf')) {
      return false;
    }

    // Most likely a plain Object
    return true;
  }
}

export default new Is;