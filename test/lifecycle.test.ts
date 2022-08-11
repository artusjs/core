import path from 'path';
import assert from 'assert';
import { createApp } from './utils';
import LifecycleList from './fixtures/app_with_lifecycle/lifecyclelist';

describe('test/lifecycle.test.ts', () => {
  it('should lifecycle works without error', async () => {
    const appWithLifeCyclePath = path.resolve(__dirname, './fixtures/app_with_lifecycle');
    const app = await createApp(appWithLifeCyclePath);
    const lifecycleList = app.container.get(LifecycleList).lifecycleList;

    assert.deepStrictEqual(lifecycleList, [
      'pluginA_configWillLoad',
      'pluginB_configWillLoad',
      'app_configWillLoad',
      'pluginA_configDidLoad',
      'pluginB_configDidLoad',
      'app_configDidLoad',
      'pluginA_didLoad',
      'pluginB_didLoad',
      'app_didLoad',
      'pluginA_willReady',
      'pluginB_willReady',
      'app_willReady',
      'pluginA_didReady',
      'pluginB_didReady',
      'app_didReady',
    ]);

    await app.close();

    assert.deepStrictEqual(lifecycleList, [
      'pluginA_configWillLoad',
      'pluginB_configWillLoad',
      'app_configWillLoad',
      'pluginA_configDidLoad',
      'pluginB_configDidLoad',
      'app_configDidLoad',
      'pluginA_didLoad',
      'pluginB_didLoad',
      'app_didLoad',
      'pluginA_willReady',
      'pluginB_willReady',
      'app_willReady',
      'pluginA_didReady',
      'pluginB_didReady',
      'app_didReady',
      'pluginA_beforeClose',
      'pluginB_beforeClose',
      'app_beforeClose',
    ]);
  });

  it('should not trigger lifecyle multi times', async () => {
    const appWithLifeCyclePath = path.resolve(__dirname, './fixtures/app_with_lifecycle');
    const app = await createApp(appWithLifeCyclePath);
    const lifecycleList = app.container.get(LifecycleList).lifecycleList;
    await Promise.all([
      app.run(),
      app.run(),
      app.run(),
    ]);

    await Promise.all([
      app.close(),
      app.close(),
      app.close(),
    ]);

    assert.deepStrictEqual(lifecycleList, [
      'pluginA_configWillLoad',
      'pluginB_configWillLoad',
      'app_configWillLoad',
      'pluginA_configDidLoad',
      'pluginB_configDidLoad',
      'app_configDidLoad',
      'pluginA_didLoad',
      'pluginB_didLoad',
      'app_didLoad',
      'pluginA_willReady',
      'pluginB_willReady',
      'app_willReady',
      'pluginA_didReady',
      'pluginB_didReady',
      'app_didReady',
      'pluginA_beforeClose',
      'pluginB_beforeClose',
      'app_beforeClose',
    ]);
  });
});
