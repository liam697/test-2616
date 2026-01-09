import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/sdk/index.tsx"],
  format: ["iife"],
  globalName: "ChatSDKV2",
  minify: true,
  clean: true,
  outDir: "../demo-host/dist",
  loader: {
    ".css": "text",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
    process: "{}",
  },
  platform: "browser",
  external: [
    "fs",
    "path",
    "os",
    "module",
    "worker_threads",
  ],
});
