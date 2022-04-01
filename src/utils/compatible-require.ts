import assert from 'assert';

/**
 * compatible esModule require
 * @param path
 */
export default function compatibleRequire(path) {
  let requiredModule = require(path);

  assert(requiredModule, `module '${path}' exports is undefined`);

  if (
      requiredModule.__esModule === true &&
      requiredModule.default !== void 0
  ) {
      requiredModule = requiredModule.default;
  }

  return requiredModule;
}