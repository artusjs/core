import "reflect-metadata";
import { ARTUS_SERVER_ENV } from "../src/constant";

describe("test/config.test.ts", () => {
  describe("app with config", () => {
    it("should config load on application", async () => {
      process.env[ARTUS_SERVER_ENV] = "production";
      const { main } = require("./fixtures/app_with_config/bootstrap");
      const app = await main();
      expect(app.config).toEqual({
        name: "test-for-config",
        plugin: {},
        test: 1,
        arr: [4, 5, 6],
      });
      process.env[ARTUS_SERVER_ENV] = undefined;
    });
  });


  describe("app with manifest should load config ok", () => {
    it("should load config ok", async () => {
      const { main } = require("./fixtures/app_with_manifest/bootstrap");
      const app = await main();
      expect(app.config).toEqual({ httpConfig: { key1: 'value1', port: 3000 }, plugin: {} });
    });
  });
});
