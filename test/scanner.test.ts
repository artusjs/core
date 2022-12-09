import 'reflect-metadata';
import { Scanner } from '../src/scanner';
import path from 'path';
import { ScanPolicy , LoaderFactory } from '../src';


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

    expect(manifest.items.find(item => item.filename === 'not_to_be_scanned_file.ts')).toBeFalsy();

    expect(manifest.items.filter(item => item.loader === 'plugin-config').length).toBe(0);
    expect(manifest.items.filter(item => item.loader === 'plugin-meta').length).toBe(1);
    expect(manifest.items.filter(item => item.loader === 'exception').length).toBe(1);
    expect(manifest.items.filter(item => item.loader === 'exception-filter').length).toBe(1);
    expect(manifest.items.filter(item => item.loader === 'lifecycle-hook-unit').length).toBe(2);
    expect(manifest.items.filter(item => item.loader === 'config').length).toBe(1);
    expect(manifest.items.filter(item => item.loader === 'module').length).toBe(4);

    expect(manifest.items.filter(item => item.unitName === 'redis').length).toBe(2);
    expect(manifest.items.filter(item => item.unitName === 'mysql').length).toBe(0);
    expect(manifest.items.filter(item => item.source === 'app').length).toBe(9);
    expect(manifest.pluginConfig).toStrictEqual({
      redis: { enable: true, path: path.join('src', 'redis_plugin') },
      mysql: { enable: false, path: path.join('src', 'mysql_plugin') },
      testDuplicate: { enable: false, path: path.join('..', '..', '..', 'node_modules', '@artus', 'injection', 'lib') },
    });

    const { dev: devManifest } = scanResults;
    // console.log('devManifest', devManifest);
    expect(devManifest).toBeDefined();
    expect(devManifest.items).toBeDefined();
    expect(devManifest.items.length).toBe(13);
    expect(devManifest.items.filter(item => item.loader === 'config').length).toBe(2);
    expect(devManifest.items.filter(item => item.loader === 'plugin-meta').length).toBe(2);
    expect(devManifest.items.find(item => item.unitName === 'testDuplicate')).toBeDefined();
    expect(devManifest.pluginConfig).toStrictEqual({
      redis: { enable: true, path: path.join('src', 'redis_plugin') },
      mysql: { enable: false, path: path.join('src', 'mysql_plugin') },
      testDuplicate: { enable: true, path: path.join('src', 'test_duplicate_plugin') },
    });
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

  it('should scan application with all injectable class', async () => {
    const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'] });
    const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/named_export'));
    const { default: manifest } = scanResults;
    expect(manifest.items).toBeDefined();
    expect(manifest.items.length).toBe(5);
  });

  it('should scan application with named export class', async () => {
    const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'], policy: ScanPolicy.NamedExport });
    const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/named_export'));
    const { default: manifest } = scanResults;
    expect(manifest.items).toBeDefined();
    expect(manifest.items.length).toBe(5);
  });

  it('should scan application with default export class', async () => {
    const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'], policy: ScanPolicy.DefaultExport });
    const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/named_export'));
    const { default: manifest } = scanResults;
    expect(manifest.items).toBeDefined();
    expect(manifest.items.length).toBe(3);
  });

  it('should not throw when scan application without configdir', async () => {
    const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'] });
    const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/app_without_config'));
    const { default: manifest } = scanResults;
    expect(manifest.items.find(item => item.loader === 'config')).toBeUndefined();
  });
});
