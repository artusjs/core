import { Context } from "@artus/pipeline";
import path from "path";
import { ArtusApplication, ArtusStdError, Trigger } from "../../../src";
import { TestCustomError, TestWrappedError } from "./error";

async function main() {
  const app = new ArtusApplication();
  app.container.set({
    id: "mock_exception_set",
    value: new Set(),
  });
  await app.load({
    version: "2",
    relative: false,
    pluginConfig: {},
    refMap: {
      _app: {
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
        ],
      },
    },
  });
  const trigger = app.container.get(Trigger);
  trigger.use((ctx: Context) => {
    const target = ctx.input.params.target;
    switch (target) {
      case "default":
        throw new Error("default error");
      case "custom":
        throw new TestCustomError();
      case "wrapped":
        throw new TestWrappedError();
      default:
        throw new ArtusStdError(target);
    }
  });
  await app.run();
  return app;
}

export { main };
