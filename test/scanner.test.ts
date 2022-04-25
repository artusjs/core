import { Scanner } from '../src/scanner';
import path from 'path';


describe('test/scanner.test.ts', () => {
    it('should scan application', async () => {
        const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'] });
        const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app-koa-with-ts'));
        expect(manifest).toBeDefined();
        expect(manifest.items).toBeDefined();
        // console.log('manifest', manifest);
        expect(manifest.items.length).toBe(14);

        expect(manifest.items.filter(item => item.loader === 'plugin-config').length).toBe(1);
        expect(manifest.items.filter(item => item.loader === 'plugin-meta').length).toBe(2);
        expect(manifest.items.filter(item => item.loader === 'exception').length).toBe(1);
        expect(manifest.items.filter(item => item.loader === 'extension').length).toBe(3);
        expect(manifest.items.filter(item => item.loader === 'config').length).toBe(1);
        expect(manifest.items.filter(item => item.loader === 'module').length).toBe(5);

        expect(manifest.items.filter(item => item.unitName === 'redis').length).toBe(2);
        expect(manifest.items.filter(item => item.unitName === 'mysql').length).toBe(2);
        expect(manifest.items.filter(item => item.source === 'app').length).toBe(10);
    });
});
