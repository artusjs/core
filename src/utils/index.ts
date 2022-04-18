import path from 'path';
import fs from 'fs';
import compatibleRequire from './compatible-require';
import minimatch from 'minimatch';

export const loadFile = async (filepath: string) => {
  try {
    const extname = path.extname(filepath);
    if (!extname) {
      return fs.readFileSync(filepath);
    }
    return compatibleRequire(filepath);
  } catch (err) {
    throw err;
  }
}

export function getDefaultExtensions() {
  return Object.keys(require.extensions)
}

export function isMatch(filename: string, patterns: string | string[]) {
  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }
  return patterns.some(pattern => minimatch(filename, pattern));
}
