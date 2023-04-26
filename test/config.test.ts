import "reflect-metadata";
import { ARTUS_SERVER_ENV } from "../src/constant";

describe("test/config.test.ts", () => {
  describe("app with config", () => {
    it("should config load on application", async () => {
      process.env[ARTUS_SERVER_ENV] = "production";
      const { main } = await import("./fixtures/app_with_config/bootstrap");
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
});
