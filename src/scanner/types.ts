

export interface ScannerOptions {
    appName: string;
    extensions: string[];
    needWriteFile: boolean;
    excluded?: string[];
}
export interface ScannerItem {
    path: string;
    extname: string;
    filename: string;
}
export interface ScannerUnit {
    items: ScannerItem[];
    packageJson?: ScannerItem;
    pluginMeta?: ScannerItem;
    config: ScannerItem[];
    pluginConfig: ScannerItem[];
    extension: ScannerItem[];
    exception: ScannerItem[];

}

export interface ScannerManifest {
    [name: string]: Partial<ScannerUnit>;
}