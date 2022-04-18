import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import { Container } from '@artus/injection';
import { DefineLoader } from '../decorator';
import { ManifestItem, Loader } from '../types';
import { ExceptionItem } from '../../exception/types';
import { ExceptionHandler } from '../../exception';

type ParserFunction = (content: string) => Record<string, ExceptionItem>;

const YamlParser: ParserFunction = (content: string): Record<string, ExceptionItem> => {
  return yaml.load(content, {
    json: true
  }) as Record<string, ExceptionItem>;
};
const JsonParser: ParserFunction = (content: string): Record<string, ExceptionItem> => {
  return JSON.parse(content) as Record<string, ExceptionItem>;
};

@DefineLoader('exception')
class ExceptionLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async load(item: ManifestItem) {
    const exceptionHandler = this.container.get(ExceptionHandler);
    let parserFunc: ParserFunction;
    if (item.extname === '.yaml' || item.extname === '.yml') {
      parserFunc = YamlParser;
    } else if (item.extname === '.json') {
      parserFunc = JsonParser;
    } else {
      throw new Error(`[Artus-Exception] Unsupported file extension: ${item.extname}`);
    }
    try {
      const content = await readFile(item.path, {
        encoding: 'utf-8'
      });
      if (!content) {
        throw new Error('File content is empty.');
      }
      const codeMap = parserFunc(content);
      for (const [errCode, exceptionItem] of Object.entries(codeMap)) {
        exceptionHandler.registerCode(errCode, exceptionItem);
      }
    } catch (error) {
      console.warn(`[Artus-Exception] Parse CodeMap ${item.path} failed: ${error.message}`);
    }
  }
}

export default ExceptionLoader;
