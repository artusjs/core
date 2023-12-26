import 'reflect-metadata';
import { ArtusApplication, ArtusInjectEnum, Manifest } from '../src';
import { LoggerLevel, LoggerOptions } from '../src/logger';

import TestLoggerClazz from './fixtures/logger/src/test_clazz';
import TestCustomLoggerClazz from './fixtures/logger/src/test_custom_clazz';
import { DEFAULT_EMPTY_MANIFEST } from './utils';

interface AppConfigWithLoggerOptions extends Record<string, any> {
  logger?: LoggerOptions;
}

const _getAppWithConfig = async (config: AppConfigWithLoggerOptions = {}, manifest: Manifest = DEFAULT_EMPTY_MANIFEST) => {
  const app = new ArtusApplication();
  await app.load(manifest);
  app.container.set({
    id: ArtusInjectEnum.Config,
    value: config,
  });
  return app;
};

const err = new Error('test');

describe('test/logger.test.ts', () => {
  beforeEach(() => {
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();
    console.trace = jest.fn();
  });

  describe('log message with default level (INFO)', () => {
    it('should log message with Logger from Contianer', async () => {
      const { default: manifest } = require('./fixtures/logger/src');
      const app = await _getAppWithConfig({}, manifest);

      const testClazz = app.container.get(TestLoggerClazz);

      testClazz.testTrace('trace', 0, {});
      expect(console.trace).toBeCalledTimes(0);

      testClazz.testDebug('debug', 1, {});
      expect(console.debug).toBeCalledTimes(0);

      testClazz.testInfo('info', 2, {});
      expect(console.info).toBeCalledTimes(1);
      expect(console.info).toBeCalledWith('info', 2, {});

      testClazz.testWarn('warn', 3, {});
      expect(console.warn).toBeCalledTimes(1);
      expect(console.warn).toBeCalledWith('warn', 3, {});

      testClazz.testError('error', 4, {});
      testClazz.testError(err, 5, {});
      expect(console.error).toBeCalledTimes(2);
      expect(console.error).toBeCalledWith('error', 4, {});
      expect(console.error).toBeCalledWith(err, 5, {});
    });

    it('should log message with Logger from Contianer and log method', async () => {
      const { default: manifest } = require('./fixtures/logger/src');
      const app = await _getAppWithConfig({}, manifest);

      const testClazz = app.container.get(TestLoggerClazz);

      testClazz.testLog(LoggerLevel.TRACE, 'trace', 0, {});
      expect(console.trace).toBeCalledTimes(0);

      testClazz.testLog(LoggerLevel.DEBUG, 'debug', 1, {});
      expect(console.debug).toBeCalledTimes(0);

      testClazz.testLog(LoggerLevel.INFO, 'info', 2, {});
      expect(console.info).toBeCalledTimes(1);
      expect(console.info).toBeCalledWith('info', 2, {});

      testClazz.testLog(LoggerLevel.WARN, 'warn', 3, {});
      expect(console.warn).toBeCalledTimes(1);
      expect(console.warn).toBeCalledWith('warn', 3, {});

      testClazz.testLog(LoggerLevel.ERROR, 'error', 4, {});
      testClazz.testLog(LoggerLevel.ERROR, err, 5, {});
      expect(console.error).toBeCalledTimes(2);
      expect(console.error).toBeCalledWith('error', 4, {});
      expect(console.error).toBeCalledWith(err, 5, {});
    });
  });

  describe('log message with custom level (TRACE)', () => {
    it('should log message with Logger from Contianer', async () => {
      const { default: manifest } = require('./fixtures/logger/src');
      const app = await _getAppWithConfig({
        logger: {
          level: LoggerLevel.TRACE,
        },
      }, manifest);

      const testClazz = app.container.get(TestLoggerClazz);

      testClazz.testTrace('trace', 0, {});
      expect(console.trace).toBeCalledTimes(1);
      expect(console.trace).toBeCalledWith('trace', 0, {});

      testClazz.testDebug('debug', 1, {});
      expect(console.debug).toBeCalledTimes(1);
      expect(console.debug).toBeCalledWith('debug', 1, {});

      testClazz.testInfo('info', 2, {});
      expect(console.info).toBeCalledTimes(1);
      expect(console.info).toBeCalledWith('info', 2, {});

      testClazz.testWarn('warn', 3, {});
      expect(console.warn).toBeCalledTimes(1);
      expect(console.warn).toBeCalledWith('warn', 3, {});

      testClazz.testError('error', 4, {});
      testClazz.testError(err, 5, {});
      expect(console.error).toBeCalledTimes(2);
      expect(console.error).toBeCalledWith('error', 4, {});
      expect(console.error).toBeCalledWith(err, 5, {});
    });

    it('should log message with Logger from Contianer and log method', async () => {
      const { default: manifest } = require('./fixtures/logger/src');
      const app = await _getAppWithConfig({
        logger: {
          level: LoggerLevel.TRACE,
        },
      }, manifest);

      const testClazz = app.container.get(TestLoggerClazz);

      testClazz.testLog(LoggerLevel.TRACE, 'trace', 0, {});
      expect(console.trace).toBeCalledTimes(1);
      expect(console.trace).toBeCalledWith('trace', 0, {});

      testClazz.testLog(LoggerLevel.DEBUG, 'debug', 1, {});
      expect(console.debug).toBeCalledTimes(1);
      expect(console.debug).toBeCalledWith('debug', 1, {});

      testClazz.testLog(LoggerLevel.INFO, 'info', 2, {});
      expect(console.info).toBeCalledTimes(1);
      expect(console.info).toBeCalledWith('info', 2, {});

      testClazz.testLog(LoggerLevel.WARN, 'warn', 3, {});
      expect(console.warn).toBeCalledTimes(1);
      expect(console.warn).toBeCalledWith('warn', 3, {});

      testClazz.testLog(LoggerLevel.ERROR, 'error', 4, {});
      testClazz.testLog(LoggerLevel.ERROR, err, 5, {});
      expect(console.error).toBeCalledTimes(2);
      expect(console.error).toBeCalledWith('error', 4, {});
      expect(console.error).toBeCalledWith(err, 5, {});
    });
  });

  describe('log message with custom Logger', () => {
    it('should log message with custom method', async () => {
      const { manifestWithCustomLogger: manifest } = require('./fixtures/logger/src');
      const app = await _getAppWithConfig({}, manifest);
      const testClazz = app.container.get(TestCustomLoggerClazz);

      testClazz.testInfo('info', 1, {});
      expect(console.info).toBeCalledTimes(1);
      expect(console.info).toBeCalledWith('[Custom]', 'info', 1, {});
    });
  });
});
