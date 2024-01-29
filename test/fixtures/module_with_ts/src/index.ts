import path from "path";
import { Manifest } from "../../../../src";

const rootDir = path.resolve(__dirname, "./");

export default {
  version: "2",
  refMap: {
    _app: {
      pluginConfig: {},
      items: [
        {
          path: path.resolve(rootDir, "./test_service_a"),
          extname: ".ts",
          filename: "test_service_a.ts",
        },
        {
          path: path.resolve(rootDir, "./test_service_b"),
          extname: ".ts",
          filename: "test_service_b.ts",
        },
      ],
    },
  },
} as Manifest;
