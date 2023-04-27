import path from "path";
import { ArtusApplication } from "../../../src";

const rootDir = path.resolve(__dirname, "./");

async function main() {
  const app = new ArtusApplication();
  await app.load({
    version: "2",
    pluginConfig: {},
    refMap: {
      _app: {
        items: [
          {
            path: path.resolve(__dirname, "./app"),
            extname: ".ts",
            filename: "app.ts",
            loader: "lifecycle-hook-unit",
            source: "app",
          },
          {
            path: path.resolve(rootDir, "./config/config.default"),
            extname: ".ts",
            filename: "config.default.ts",
            loader: "config",
            source: "app",
          },
          {
            path: path.resolve(rootDir, "./config/config.production"),
            extname: ".ts",
            filename: "config.production.ts",
            loader: "config",
            source: "app",
          },
        ],
      },
    },
  });
  return app;
}

export { main };
