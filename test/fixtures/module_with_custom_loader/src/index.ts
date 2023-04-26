import path from "path";
import { Manifest } from "../../../../src";

const rootDir = path.resolve(__dirname, "./");

export default {
  version: "2",
  relative: false,
  pluginConfig: {},
  refMap: {
    _app: {
      items: [
        {
          path: path.resolve(rootDir, "./test_clazz.ts"),
          extname: ".ts",
          filename: "test_clazz.ts",
          loader: "test-custom-loader",
          loaderState: {
            hello: "loaderState",
          },
        },
      ],
    },
  },
} as Manifest;
