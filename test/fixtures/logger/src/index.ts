import path from "path";
import { Manifest } from "../../../../src";

const rootDir = path.resolve(__dirname, "./");

const defaultManifest: Manifest = {
  version: "2",
  pluginConfig: {},
  refMap: {
    _app: {
      items: [
        {
          path: path.resolve(rootDir, "./test_clazz"),
          extname: ".ts",
          filename: "test_clazz.ts",
        },
      ],
    },
  },
};

export const manifestWithCustomLogger: Manifest = {
  version: "2",
  pluginConfig: {},
  refMap: {
    _app: {
      items: [
        ...defaultManifest.refMap._app.items,
        {
          path: path.resolve(rootDir, "./test_custom_clazz"),
          extname: ".ts",
          filename: "test_custom_clazz.ts",
        },
        {
          path: path.resolve(rootDir, "./custom_logger"),
          extname: ".ts",
          filename: "custom_logger.ts",
        },
      ],
    },
  },
};

export default defaultManifest;
