import { Scanner } from '../src/scanner';
import path from 'path';
import { LoaderFactory } from '../src';


describe('test/scanner.test.ts', () => {
  it('should scan application', async () => {
    const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'] });
    const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/app_koa_with_ts'));
    const { default: manifest } = scanResults;
    expect(Object.entries(scanResults).length).toBe(2);
    expect(manifest).toBeDefined();
    expect(manifest.items).toBeDefined();
    // console.log('manifest', manifest);
    expect(manifest.items.length).toBe(11);

    expect(manifest.items.filter(item => item.loader === 'plugin-config').length).toBe(0);
    expect(manifest.items.filter(item => item.loader === 'plugin-meta').length).toBe(1);
    expect(manifest.items.filter(item => item.loader === 'exception').length).toBe(1);
    expect(manifest.items.filter(item => item.loader === 'lifecycle-hook-unit').length).toBe(2);
    expect(manifest.items.filter(item => item.loader === 'config').length).toBe(1);
    expect(manifest.items.filter(item => item.loader === 'module').length).toBe(5);

    expect(manifest.items.filter(item => item.unitName === 'redis').length).toBe(2);
    expect(manifest.items.filter(item => item.unitName === 'mysql').length).toBe(0);
    expect(manifest.items.filter(item => item.source === 'app').length).toBe(9);

    const { dev: devManifest } = scanResults;
    // console.log('devManifest', devManifest);
    expect(devManifest).toBeDefined();
    expect(devManifest.items).toBeDefined();
    expect(devManifest.items.length).toBe(12);
    expect(devManifest.items.filter(item => item.loader === 'plugin-meta').length).toBe(2);
    expect(devManifest.items.find(item => item.unitName === 'testDuplicate')).toBeDefined();
  });

  it('should scan module with custom loader', async () => {
    // TODO: allow scan custom loader
    const { default: TestCustomLoader } = await import('./fixtures/module_with_custom_loader/src/loader/test_custom_loader');
    LoaderFactory.register(TestCustomLoader);

    const scanner = new Scanner({
      needWriteFile: false,
      extensions: ['.ts', '.js', '.json'],
      configDir: '.',
      loaderListGenerator: () => [TestCustomLoader],
    });
    const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/module_with_custom_loader'));
    const { default: manifest } = scanResults;
    // console.log('manifest', manifest);
    expect(Object.entries(scanResults).length).toBe(1);
    expect(manifest).toBeDefined();
    expect(manifest.items).toBeDefined();
    expect(Array.isArray(manifest.items)).toBe(true);
    expect(manifest.items.length).toBe(1);
    expect(manifest.items[0]?.loader).toBe('test-custom-loader');
  });
});
