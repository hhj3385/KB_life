import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DATABASE_URL: "file:./test.db",
      NODE_ENV: "test",
    },
    globalSetup: ["./vitest.globalsetup.ts"],
    testTimeout: 15000,
  },
});
