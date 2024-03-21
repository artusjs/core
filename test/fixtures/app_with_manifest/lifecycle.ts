import { LifecycleHookUnit, ApplicationLifecycle, LifecycleHook, Inject, ArtusApplication, ArtusInjectEnum } from '../../../src';

@LifecycleHookUnit()
export default class MyLifecycle implements ApplicationLifecycle {
    @Inject(ArtusInjectEnum.Application)
    private app: ArtusApplication;

    @LifecycleHook()
    public async configWillLoad() {
        this.app.config.httpConfig = this.app.config.httpConfig ?? {};
        this.app.config.httpConfig.key1 = 'value1';
    }
}
