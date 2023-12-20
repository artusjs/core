import assert from 'assert';

/**
 * compatible esModule require
 * @param path
 */
export default async function compatibleRequire(path: string, origin = false): Promise<any> {
  if (path.endsWith('.json')) {
    return require(path);
  }
  let requiredModule = await import(path);

  assert(requiredModule, `module '${path}' exports is undefined`);

  requiredModule = requiredModule.__esModule ? requiredModule.default ?? requiredModule : requiredModule;

  return origin ? requiredModule : (requiredModule.default || requiredModule);
}