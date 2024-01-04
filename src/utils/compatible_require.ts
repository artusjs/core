import assert from 'assert';
import * as tslib from 'tslib';

/**
 * compatible esModule require
 * @param path
 */
export default async function compatibleRequire(path: string, origin = false): Promise<any> {
  if (path.endsWith('.json')) {
    return require(path);
  }

  let requiredModule;
  try {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    requiredModule = tslib.__importStar(require(path));
    assert(requiredModule, `module '${path}' exports is undefined`);
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM') {
      requiredModule = await import(path);
      assert(requiredModule, `module '${path}' exports is undefined`);
      requiredModule = requiredModule.__esModule ? requiredModule.default ?? requiredModule : requiredModule;
    } else {
      throw err;
    }
  }

  return origin ? requiredModule : (requiredModule.default || requiredModule);
}