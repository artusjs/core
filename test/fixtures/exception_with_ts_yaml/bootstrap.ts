import path from "path";
import { ArtusApplication } from "../../../src";
import { server } from "./app";

async function main() {
  const app = new ArtusApplication();
  await app.load({
    version: "2",
    refMap: {
      _app: {
        pluginConfig: {},
        items: [
          {
            path: path.resolve(__dirname, "./app"),
            extname: ".ts",
            filename: "app.ts",
            loader: "lifecycle-hook-unit",
            source: "app",
          },
          {
            path: path.resolve(__dirname, "../../../exception.json"),
            extname: ".json",
            filename: "exception.json",
            loader: "exception",
            source: "app",
          },
          {
            path: path.resolve(__dirname, "./exception.json"),
            extname: ".json",
            filename: "exception.json",
            loader: "exception",
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
