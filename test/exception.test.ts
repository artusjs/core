import 'reflect-metadata';
import assert from 'assert';
import { ArtusStdError } from '../src/exception';
import { ExceptionItem } from '../src/exception/types';

describe('test/app.test.ts', () => {
  describe('register error code and throw', () => {
    const errorCode = 'ARTUS:TEMP_TEST';
    const exceptionItem: ExceptionItem = {
      desc: 'TEST-DESC',
      detailUrl: 'http://test.artusjs.org',
    };
    ArtusStdError.registerCode(errorCode, exceptionItem);
    try {
      throw new ArtusStdError(errorCode);
    } catch (error) {
      assert(error instanceof ArtusStdError);
      assert(error.code === errorCode);
      assert(error.desc === exceptionItem.desc);
      assert(error.detailUrl === exceptionItem.detailUrl);
    }
    const error = new ArtusStdError(errorCode);
    assert(error instanceof ArtusStdError);
    assert(error.code === errorCode);
    assert(error.desc === exceptionItem.desc);
    assert(error.detailUrl === exceptionItem.detailUrl);

    try {
      throw new ArtusStdError('UNKNWON_CODE');
    } catch (error) {
      assert(error instanceof ArtusStdError);
      assert(error.code === 'UNKNWON_CODE');
      assert(error.desc === 'Unknown Error');
      assert(error.detailUrl === undefined);
    }
  });

  describe('register error code and throw, with i18n', () => {
    const errorCode = 'ARTUS:TEMP_TEST_I18N';
    const exceptionItem: ExceptionItem = {
      desc: {
        zh: 'TEST-DESC-ZH',
        en: 'TEST-DESC-EN',
      },
      detailUrl: 'http://test.artusjs.org',
    };
    ArtusStdError.registerCode(errorCode, exceptionItem);
    [
      undefined,
      'zh',
      'en',
    ].forEach(locale => {
      if (locale) {
        ArtusStdError.setCurrentLocale(locale);
      }
      const tDesc = exceptionItem.desc[locale || 'en'];
      try {
        throw new ArtusStdError(errorCode);
      } catch (error) {
        assert(error instanceof ArtusStdError);
        assert(error.code === errorCode);
        assert(error.desc === tDesc);
        assert(error.detailUrl === exceptionItem.detailUrl);
      }
      const error = new ArtusStdError(errorCode);
      assert(error instanceof ArtusStdError);
      assert(error.code === errorCode);
      assert(error.desc === tDesc);
      assert(error.detailUrl === exceptionItem.detailUrl);
    });
  });

  describe('app test for ts and yaml', () => {
    it('should run app', async () => {
      try {
        const {
          main,
        } = require('./fixtures/exception_with_ts_yaml/bootstrap');
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
