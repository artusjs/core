import path from "path";
import { ArtusApplication } from "../../../src";

async function main() {
  const app = new ArtusApplication();
  app.container.set({
    id: "mock_exception_set",
    value: new Set(),
  });
  await app.load({
    version: "2",
    refMap: {
      _app: {
        pluginConfig: {},
        items: [
          {
            path: path.resolve(__dirname, "./filter"),
            extname: ".ts",
            filename: "filter.ts",
            loader: "exception-filter",
            loaderState: {
              exportNames: [
                "TestDefaultExceptionHandler",
                "TestAppCodeExceptionHandler",
                "TestWrappedExceptionHandler",
                "TestCustomExceptionHandler",
                "TestDefaultInheritExceptionHandler",
                "TestInheritExceptionHandler",
              ],
            },
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
          {
            path: path.resolve(__dirname, "./service"),
            extname: ".ts",
            filename: "service.ts",
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

export { main };
