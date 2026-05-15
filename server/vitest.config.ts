import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://localhost:5432/kb_booth_test",
      NODE_ENV: "test",
    },
    globalSetup: ["./vitest.globalsetup.ts"],
    testTimeout: 15000,
  },
});
