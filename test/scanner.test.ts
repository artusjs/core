import { Scanner } from '../src/scanner';
import path from 'path';


describe('test/scanner.test.ts', () => {
    it('should scan application', async () => {
        const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'] });
        const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/app-koa-with-ts'));
        const { default: manifest } = scanResults;
        expect(Object.entries(scanResults).length).toBe(1);
        expect(manifest).toBeDefined();
        expect(manifest.items).toBeDefined();
        // console.log('manifest', manifest);
        expect(manifest.items.length).toBe(12);

        expect(manifest.items.filter(item => item.loader === 'plugin-config').length).toBe(1);
        expect(manifest.items.filter(item => item.loader === 'plugin-meta').length).toBe(1);
        expect(manifest.items.filter(item => item.loader === 'exception').length).toBe(1);
        expect(manifest.items.filter(item => item.loader === 'extension').length).toBe(2);
        expect(manifest.items.filter(item => item.loader === 'config').length).toBe(1);
        expect(manifest.items.filter(item => item.loader === 'module').length).toBe(5);

        expect(manifest.items.filter(item => item.unitName === 'redis').length).toBe(2);
        expect(manifest.items.filter(item => item.unitName === 'mysql').length).toBe(0);
        expect(manifest.items.filter(item => item.source === 'app').length).toBe(10);
    });

    it('should scan module with custom loader', async () => {
      await import('./fixtures/module-with-custom-loader/src');
      const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'], configDir: '.', loaderListGenerator: () => ['test-custom-loader'] });
      const scanResults = await scanner.scan(path.resolve(__dirname, './fixtures/module-with-custom-loader'));
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
