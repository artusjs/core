import { Scanner } from '../src/scanner';
import path from 'path';


describe('test/scanner.test.ts', () => {
    it('should scan application', async () => {
        const scanner = new Scanner({ needWriteFile: false, extensions: ['.ts', '.js', '.json'] });
        const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app-koa-with-ts'));
        expect(manifest).toBeDefined();
        const appManifest = manifest.app;
        expect(appManifest.items).toBeDefined();
        expect(appManifest.packageJson).toBeDefined();
        expect(appManifest.config!.length).toBe(1);
        expect(appManifest.pluginConfig!.length).toBe(1);
        expect(appManifest.pluginConfig!.length).toBe(1);
        expect(appManifest.exception!.length).toBe(1);
        expect(appManifest.extension!.length).toBe(1);

        expect(manifest.plugins).toBeDefined();
        const pluginManifest = manifest.plugins['redis'];
        expect(pluginManifest.pluginMeta).toBeDefined();
        expect(pluginManifest.extension!.length).toBe(1);
    })
});