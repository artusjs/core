import { Injectable, ScopeEnum } from '@artus/injection';
import fs from 'fs';
import path from 'path';
import { configSet } from '../loader'

export type FrameworkParams = {
  configDir?: string
};
export function DefineFramework(options?: FrameworkParams): ClassDecorator {
  const configDir = options?.configDir;
  if (configDir && fs.existsSync(configDir)) {
    const files = fs.readdirSync(configDir);
    files.forEach(file => configSet.framework.add(path.join(configDir, file)));
  }

  return (target: any) => Injectable({
    scope: ScopeEnum.SINGLETON
  })(target);
};
