import 'reflect-metadata';
import { ArtusScanner } from '../src/scanner';
import path from 'path';
import { DEFAULT_APP_REF, ScanPolicy } from '../src';
import { formatManifestForWindowsTest } from './utils';

describe('test/scanner.test.ts', () => {
  it('should be scan application', async () => {
    const scanner = new ArtusScanner({ needWriteFile: false, extensions: ['.ts'] });
    let manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app_koa_with_ts'));
    expect(manifest.version).toBe('2');

    manifest = formatManifestForWindowsTest(manifest);
    expect(manifest).toMatchSnapshot();

    // scan with relative root
    const relativeRoot = path.relative(process.cwd(), __dirname);
    let relativeRootManifest = await scanner.scan(path.join(relativeRoot, './fixtures/app_koa_with_ts'));
    relativeRootManifest = formatManifestForWindowsTest(relativeRootManifest);
    expect(relativeRootManifest).toStrictEqual(manifest);
  });

  it('should scan application with all injectable class', async () => {
    const scanner = new ArtusScanner({ needWriteFile: false, extensions: ['.ts'] });
    const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/named_export'));
    expect(manifest?.refMap?.[DEFAULT_APP_REF]?.items).toBeDefined();
    expect(manifest.refMap?.[DEFAULT_APP_REF]?.items.length).toBe(4);
  });

  it('should scan application with named export class', async () => {
    const scanner = new ArtusScanner({ needWriteFile: false, extensions: ['.ts'], policy: ScanPolicy.NamedExport });
    const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/named_export'));
    expect(manifest?.refMap?.[DEFAULT_APP_REF]?.items).toBeDefined();
    expect(manifest?.refMap?.[DEFAULT_APP_REF]?.items.length).toBe(4);
  });

  it('should scan application with default export class', async () => {
    const scanner = new ArtusScanner({ needWriteFile: false, extensions: ['.ts'], policy: ScanPolicy.DefaultExport });
    const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/named_export'));
    expect(manifest?.refMap?.[DEFAULT_APP_REF]?.items).toBeDefined();
    expect(manifest?.refMap?.[DEFAULT_APP_REF]?.items.length).toBe(2);
  });

  it('should not throw when scan application without configdir', async () => {
    const scanner = new ArtusScanner({ needWriteFile: false, extensions: ['.ts'] });
    const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app_without_config'));
    expect(manifest?.refMap?.[DEFAULT_APP_REF]?.items?.find(item => item.loader === 'config')).toBeUndefined();
  });

  it('should scan application with nesting preset a which defined in options', async () => {
    const scanner = new ArtusScanner({
      needWriteFile: false,
      configDir: 'config',
      extensions: ['.ts'],
      plugin: {
        preset_a: {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugins/preset_a'),
        },
      },
    });
    let manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app_empty'));
    manifest = formatManifestForWindowsTest(manifest);
    expect(manifest).toMatchSnapshot();
  });

  it('should scan application with single preset b which defined in config', async () => {
    const scanner = new ArtusScanner({ needWriteFile: false, extensions: ['.ts'], configDir: 'config' });
    let manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app_with_preset_b'));
    manifest = formatManifestForWindowsTest(manifest);
    expect(manifest).toMatchSnapshot();
  });

  it('should scan application with single preset c which defined in options', async () => {
    const scanner = new ArtusScanner({
      needWriteFile: false,
      configDir: 'config',
      extensions: ['.ts'],
      plugin: {
        preset_c: {
          enable: true,
          path: path.resolve(__dirname, './fixtures/plugins/preset_c'),
        },
      },
    });
    let manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app_empty'));
    manifest = formatManifestForWindowsTest(manifest);
    expect(manifest).toMatchSnapshot();
  });

  it('should find multipie version and fail', async () => {
    const scanner = new ArtusScanner({
      needWriteFile: false,
      configDir: 'config',
      extensions: ['.ts'],
      plugin: {
        a: {
          enable: true,
          refName: 'test',
          path: path.resolve(__dirname, './fixtures/plugins/plugin_a_other_ver'),
        },
      },
    });
    await expect(scanner.scan(path.resolve(__dirname, './fixtures/app_with_plugin_version_check'))).rejects.toThrowErrorMatchingSnapshot();
  });
  it('should find multi path with same version and fail', async () => {
    const scanner = new ArtusScanner({
      needWriteFile: false,
      configDir: 'config',
      extensions: ['.ts'],
      plugin: {
        a: {
          enable: true,
          refName: 'test',
          path: path.resolve(__dirname, './fixtures/plugins/plugin_a_same_ver'),
        },
      },
    });
    await expect(scanner.scan(path.resolve(__dirname, './fixtures/app_with_plugin_version_check'))).rejects.toThrowErrorMatchingSnapshot();
  });

});

