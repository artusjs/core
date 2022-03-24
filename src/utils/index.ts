import path from 'path';
import fs from 'fs';
import compatibleRequire from './compatible-require';



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


