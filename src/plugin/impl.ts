import { BasePlugin } from './base';

export class ArtusPlugin extends BasePlugin {
  async init() {
    if (!this.enable) {
      return;
    }
    let pkgJson: Record<string, any>;
    try {
      pkgJson = await import(this.importPath + '/package.json');
    } catch (error) {
      throw new Error(`${this.name} is not have a package.json file`);
    }
    if (!pkgJson?.artusjsPlugin) {
      throw new Error(`${this.name} is not an Artus plugin`);
    }
    this.metadata = pkgJson.artusjsPlugin;
    if (this.metadata.name !== this.name) {
      throw new Error(`${this.name} metadata invalid, name is ${this.metadata.name}`);
    }
  }
}
