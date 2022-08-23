import assert from 'assert';

/**
 * compatible esModule require
 * @param path
 */
export default async function compatibleRequire(path: string, origin = false): Promise<any> {
  const requiredModule = await import(path);

  assert(requiredModule, `module '${path}' exports is undefined`);

  return origin ? requiredModule : (requiredModule.default || requiredModule);
}