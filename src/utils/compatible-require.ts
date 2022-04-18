import assert from 'assert';

/**
 * compatible esModule require
 * @param path
 */
export default async function compatibleRequire(path: string): Promise<any> {
  let requiredModule = await import(path);

  assert(requiredModule, `module '${path}' exports is undefined`);

  return requiredModule.default || requiredModule;
}