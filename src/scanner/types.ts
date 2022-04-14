
import { ManifestItem } from "../loader";

export interface ScannerOptions {
    appName: string;
    extensions: string[];
    needWriteFile: boolean;
    excluded?: string[];
}

export interface ScannerItem extends ManifestItem {
    filename: string;
    filenameWithoutExt: string;
}


export interface ScannerManifest {
    [index: string]: {
        items: ScannerItem[];
        packageJson?: string;
        pluginMeta?: string;
        config?: ScannerItem[];
        pluginConfig?: ScannerItem[];

    }
}