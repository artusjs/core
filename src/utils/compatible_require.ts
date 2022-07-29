import assert from 'assert';

/**
 * compatible esModule require
 * @param path
 */
export default async function compatibleRequire(path: string, selectDefault = true): Promise<any> {
  const requiredModule = await import(path);

  assert(requiredModule, `module '${path}' exports is undefined`);

  if (selectDefault) {
    return requiredModule.default || requiredModule;
  }

  return requiredModule;
}