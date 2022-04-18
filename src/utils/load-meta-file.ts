import yaml from 'js-yaml';
import { readFile } from 'fs/promises';
import { ManifestItem } from '../loader/types';

type ParserFunction = <T = Record<string, any>>(content: string) => T;

const YamlParser: ParserFunction = <T = Record<string, any>>(content: string) => {
  return yaml.load(content, {
    json: true
  }) as T;
};
const JsonParser: ParserFunction = <T = Record<string, any>>(content: string) => {
  return JSON.parse(content) as T;
};

export const loadMetaFile = async <T = Record<string, any>>(item: ManifestItem): Promise<T> => {
  let parserFunc: ParserFunction;
  if (item.extname === '.yaml' || item.extname === '.yml') {
    parserFunc = YamlParser;
  } else if (item.extname === '.json') {
    parserFunc = JsonParser;
  } else {
    throw new Error(`[Artus-Loader] Unsupported file extension: ${item.extname} in ${item.path}`);
  }
  const content = await readFile(item.path, {
    encoding: 'utf-8'
  });
  if (!content) {
    throw new Error(`[Artus-Loader] File content is empty in ${item.path}.`);
  }
  const resultMap = parserFunc<T>(content);
  return resultMap;
};
