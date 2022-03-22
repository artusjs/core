import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ExceptionItem } from './types';
import { ArtusStdError } from './error';
import { HookFunction } from '../lifecycle';

type ParserFunction = (content: string) => Record<string, ExceptionItem>;

const YamlParser: ParserFunction = (content: string): Record<string, ExceptionItem> => {
  return yaml.load(content, {
    json: true
  }) as Record<string, ExceptionItem>;
};
const JsonParser: ParserFunction = (content: string): Record<string, ExceptionItem> => {
  return JSON.parse(content) as Record<string, ExceptionItem>;
};
const FILE_META_LIST: [string, ParserFunction][] = [
  ['./artus-exception.yaml', YamlParser],
  ['./artus-exception.yml', YamlParser],
  ['./artus-exception.json', JsonParser]
];

export const initException: HookFunction = async ({ app }) => {
  const pathList: string[] = [];
  // TODO: 待补充读取插件列表，从插件根目录读取 exception 声明文件
  pathList.push(path.resolve(__dirname, '../../')); // Artus 主包异常声明
  if (app.manifest?.rootDir) {
    pathList.push(app.manifest?.rootDir); // 应用根目录异常声明
  }
  for (const rootPath of pathList) {
    for (const [filename, parserFunc] of FILE_META_LIST) {
      const filePath = path.resolve(rootPath, filename);
      if (!fs.existsSync(filePath)) {
        continue;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content) {
        continue;
      }
      try {
        const codeMap = parserFunc(content);
        for (const [errCode, exceptionItem] of Object.entries(codeMap)) {
          ArtusStdError.registerCode(errCode, exceptionItem);
        }
      } catch (error) {
        console.warn(`[Artus-Exception] Parse CodeMap ${filename} failed: ${error.message}`);
      }
    }
  }
};
