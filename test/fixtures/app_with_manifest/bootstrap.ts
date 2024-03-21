import path from "path";
// import fs from 'fs';
import 'reflect-metadata';
import { ArtusApplication } from "../../../src";

const rootDir = path.resolve(__dirname, "./");

async function main() {
  const app = new ArtusApplication();
  const metaFilePath = path.resolve(rootDir, 'manifest.json');
  //   let manifest;
  // if (fs.existsSync(metaFilePath)) {
  const manifest = require((metaFilePath));
  // } else {
  // const scanner = new ArtusScanner({
  //     configDir: 'config',
  //     needWriteFile: true,
  //     useRelativePath: true,
  //     extensions: ['.ts', '.js', '.json'],
  //     app,
  // });
  // manifest = await scanner.scan(rootDir);
  // }
  await app.load(manifest, rootDir);
  await app.run();
  return app;

}
export { main };
