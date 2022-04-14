import { Scanner } from '../src/scanner';
import path from 'path';


describe('test/scanner.test.ts', () => {
    it('should scan application', async () => {
        const scanner = new Scanner({ needWriteFile: false, appName: 'app-koa', extensions: ['.ts', '.js', '.json'] });
        const manifest = await scanner.scan(path.resolve(__dirname, './fixtures/app-koa-with-ts'));
        expect(manifest).toBeDefined();
        const appManifest = manifest['app-koa'];
        expect(appManifest.items).toBeDefined();
        expect(appManifest.packageJson).toBeDefined();
        expect(appManifest.config!.length).toBe(1);
        expect(appManifest.pluginConfig!.length).toBe(1);

        expect(manifest.redis).toBeDefined();
        const pluginManifest = manifest['redis'];
        expect(pluginManifest.pluginMeta).toBeDefined();
    })
});