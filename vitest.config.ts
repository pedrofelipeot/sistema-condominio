import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    env: loadEnv("test", process.cwd(), ""),
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});