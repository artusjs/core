export function isString(arg: any): boolean {
  return typeof arg === 'string';
}

export function isFunction(arg: any): boolean {
  return typeof arg === 'function';
}

export function isPromise(arg: any): boolean {
  return arg && 'function' === typeof arg.then;
}

export function isClass(arg: any): boolean {
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

export function isObject(arg: any): boolean {
  return arg !== null && typeof arg === 'object';
}

export function isObjectObject(o) {
  return (
    isObject(o) &&
    Object.prototype.toString.call(o) === '[object Object]'
  );
}

export function isPlainObject(o) {
  if (!isObjectObject(o)) {
    return false;
  }

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor !== 'function') {
    return false;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!isObjectObject(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  // Most likely a plain Object
  return true;
}
