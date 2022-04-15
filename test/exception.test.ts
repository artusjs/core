import 'reflect-metadata';
import assert from 'assert';
import { ArtusStdError, ErrorCodeUtils, ExceptionHandler } from '../src/exception';
import { ExceptionItem } from '../src/exception/types';

describe('test/app.test.ts', () => {
  describe('register error code and throw', () => {
    const exceptionHandler = new ExceptionHandler();
    const errorCode: string = 'ARTUS:TEMP_TEST';
    const exceptionItem: ExceptionItem = {
      desc: 'TEST-DESC',
      detailUrl: 'http://test.artusjs.org'
    };
    exceptionHandler.registerCode(errorCode, exceptionItem);
    try {
      exceptionHandler.throw(errorCode);
    } catch (error) {
      assert(error instanceof ArtusStdError);
      assert(error.code === errorCode);
      assert(error.desc === exceptionItem.desc);
      assert(error.detailUrl === exceptionItem.detailUrl);
    }
    const error = exceptionHandler.create(errorCode);
    assert(error instanceof ArtusStdError);
    assert(error.code === errorCode);
    assert(error.desc === exceptionItem.desc);
    assert(error.detailUrl === exceptionItem.detailUrl);
  });

  describe('register error code and throw, with i18n', () => {
    const exceptionHandler = new ExceptionHandler();
    const errorCode: string = 'ARTUS:TEMP_TEST_I18N';
    const exceptionItem: ExceptionItem = {
      desc: {
        zh: 'TEST-DESC-ZH',
        en: 'TEST-DESC-EN'
      },
      detailUrl: 'http://test.artusjs.org'
    };
    exceptionHandler.registerCode(errorCode, exceptionItem);
    [
      undefined,
      'zh',
      'en'
    ].forEach((locale) => {
      if (locale) {
        process.env.ARTUS_ERROR_LOCALE = locale;
      }
      const tDesc = exceptionItem.desc[locale || 'en'];
      const tmpCodeMap: Map<string, ExceptionItem> = new Map([
        [errorCode, exceptionItem]
      ]);
      assert(ErrorCodeUtils.getI18NDesc(tmpCodeMap, errorCode, locale) === tDesc);
      try {
        exceptionHandler.throw(errorCode);
      } catch (error) {
        assert(error instanceof ArtusStdError);
        assert(error.code === errorCode);
        assert(error.desc === tDesc);
        assert(error.detailUrl === exceptionItem.detailUrl);
      }
      const error = exceptionHandler.create(errorCode);
      assert(error instanceof ArtusStdError);
      assert(error.code === errorCode);
      assert(error.desc === tDesc);
      assert(error.detailUrl === exceptionItem.detailUrl);
    })
  });

  describe('app test for ts and yaml', () => {
    it('should run app', async () => {
      try {
        const {
          main
        } = await import('./fixtures/exception-with-ts-yaml/bootstrap');
        const app = await main();

        try {
          app.throwException('ARTUS:GLOBAL_TEST');
        } catch (error) {
          expect(error).toBeInstanceOf(ArtusStdError);
          expect(error.code).toBe('ARTUS:GLOBAL_TEST');
          expect(error.desc).toBe('全局测试错误，仅用于单元测试');
          expect(error.detailUrl).toBe('https://github.com/artusjs/spec');
        }
        try {
          app.throwException('APP:TEST_ERROR');
        } catch (error) {
          expect(error).toBeInstanceOf(ArtusStdError);
          expect(error.code).toBe('APP:TEST_ERROR');
          expect(error.desc).toBe('这是一个测试用的错误');
          expect(error.detailUrl).toBe('https://github.com/artusjs');
        }
        try {
          process.env.ARTUS_ERROR_LOCALE = 'en';
          app.throwException('ARTUS:GLOBAL_TEST_I18N');
        } catch (error) {
          expect(error).toBeInstanceOf(ArtusStdError);
          expect(error.code).toBe('ARTUS:GLOBAL_TEST_I18N');
          expect(error.desc).toBe('This is a test exception, only valid in unit-test');
          expect(error.detailUrl).toBe('https://github.com/artusjs/spec');
        }

        const error = app.createException('ARTUS:GLOBAL_TEST');
        expect(error).toBeInstanceOf(ArtusStdError);
        expect(error.code).toBe('ARTUS:GLOBAL_TEST');
        expect(error.desc).toBe('全局测试错误，仅用于单元测试');
        expect(error.detailUrl).toBe('https://github.com/artusjs/spec');

        await app.close();
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  });
});
