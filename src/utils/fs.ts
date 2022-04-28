import fs from 'fs/promises';

export async function exisis(path: string): Promise<boolean> {
  try {
    await fs.access(path);
  } catch {
    return false;
  }
  return true;
};