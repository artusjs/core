import "reflect-metadata";
import path from "path";
import { ArtusApplication } from "../../../../src";
import { server } from "./app";

export const app: ArtusApplication = new ArtusApplication();

async function main() {
  await app.load({
    version: '2',
    relative: false,
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
            path: path.resolve(__dirname, "./koa_app"),
            extname: ".ts",
            filename: "koaApp.ts",
            loader: "module",
            source: "app",
          },
          {
            path: path.resolve(__dirname, "./http_trigger"),
            extname: ".ts",
            filename: "httpTrigger.ts",
            loader: "module",
            source: "app",
          },
          {
            path: path.resolve(__dirname, "./controllers/hello"),
            extname: ".ts",
            filename: "hello.ts",
            loader: "module",
            source: "app",
          },
          {
            path: path.resolve(__dirname, "./services/hello"),
            extname: ".ts",
            filename: "hello.ts",
            loader: "module",
            source: "app",
          },
        ],
      },
    },
  });
  await app.run();

  return app;
}

const isListening = () => server.listening;

export { main, isListening };
