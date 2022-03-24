import 'reflect-metadata';
import assert from 'assert';
import { getArtusApplication } from '../src';
import { ArtusStdError, ErrorCodeUtils, ExceptionHandler } from '../src/exception';
import { ExceptionItem } from '../src/exception/types';

describe('test/app.test.ts', () => {
  describe('register error code and throw', () => {
    const errorCode: string = 'ARTUS:TEMP_TEST';
    const exceptionItem: ExceptionItem = {
      desc: 'TEST-DESC',
      detailUrl: 'http://test.artusjs.org'
    };
    ArtusStdError.registerCode(errorCode, exceptionItem);
    const handler = new ExceptionHandler();
    try {
      handler.throw(errorCode);
    } catch (error) {
      assert(error instanceof ArtusStdError);
      assert(error.code === errorCode);
      assert(error.desc === exceptionItem.desc);
      assert(error.detailUrl === exceptionItem.detailUrl);
    }
    const error = handler.create(errorCode);
    assert(error instanceof ArtusStdError);
    assert(error.code === errorCode);
    assert(error.desc === exceptionItem.desc);
    assert(error.detailUrl === exceptionItem.detailUrl);
  });

  describe('register error code and throw, with i18n', () => {
    const errorCode: string = 'ARTUS:TEMP_TEST_I18N';
    const exceptionItem: ExceptionItem = {
      desc: {
        zh: 'TEST-DESC-ZH',
        en: 'TEST-DESC-EN'
      },
      detailUrl: 'http://test.artusjs.org'
    };
    ArtusStdError.registerCode(errorCode, exceptionItem);
    const handler = new ExceptionHandler();
    [
      undefined,
      'zh',
      'en'
    ].forEach((locale) => {
      if (locale) {
        process.env.ARTUS_ERROR_LOCALE = locale;
      }
      const tDesc = exceptionItem.desc[locale || 'en'];
      assert(ErrorCodeUtils.getI18NDesc(errorCode, locale) === tDesc);
      try {
        handler.throw(errorCode);
      } catch (error) {
        assert(error instanceof ArtusStdError);
        assert(error.code === errorCode);
        assert(error.desc === tDesc);
        assert(error.detailUrl === exceptionItem.detailUrl);
      }
      const error = handler.create(errorCode);
      assert(error instanceof ArtusStdError);
      assert(error.code === errorCode);
      assert(error.desc === tDesc);
      assert(error.detailUrl === exceptionItem.detailUrl);
    })
  });

  describe('app test for ts and yaml', () => {
    it('should run app', async () => {
      const {
        main
      } = await import('./fixtures/exception-with-ts-yaml/app');
      const app = getArtusApplication();
      await main();

      try {
        app.throwException('ARTUS:GLOBAL_TEST');
      } catch (error) {
        assert(error instanceof ArtusStdError);
        assert(error.code === 'ARTUS:GLOBAL_TEST');
        assert(error.desc === '全局测试错误，仅用于单元测试');
        assert(error.detailUrl === 'https://github.com/artusjs/spec');
      }
      try {
        app.throwException('APP:TEST_ERROR');
      } catch (error) {
        assert(error instanceof ArtusStdError);
        assert(error.code === 'APP:TEST_ERROR');
        assert(error.desc === '这是一个测试用的错误');
        assert(error.detailUrl === 'https://github.com/artusjs');
      }
      try {
        process.env.ARTUS_ERROR_LOCALE = 'en';
        app.throwException('ARTUS:GLOBAL_TEST_I18N');
      } catch (error) {
        assert(error instanceof ArtusStdError);
        assert(error.code === 'ARTUS:GLOBAL_TEST_I18N');
        assert(error.desc === 'This is a test exception, only valid in unit-test');
        assert(error.detailUrl === 'https://github.com/artusjs/spec');
      }

      const error = app.createException('ARTUS:GLOBAL_TEST');
      assert(error instanceof ArtusStdError);
      assert(error.code === 'ARTUS:GLOBAL_TEST');
      assert(error.desc === '全局测试错误，仅用于单元测试');
      assert(error.detailUrl === 'https://github.com/artusjs/spec');

      await app.close();
    });
  });
});
