const { build } = require("esbuild");
const { resolve } = require("path");

const buildConfig = {
  entryPoints: [resolve(__dirname, "dist/server.js")],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  outfile: resolve(__dirname, "dist/server.bundle.js"),
  external: [
    // Keep Node.js built-in modules external
    "fs",
    "path",
    "url",
    "os",
    "crypto",
    "util",
    "stream",
    "events",
    "http",
    "https",
    "net",
    "tls",
    "zlib",
    "querystring",
    "child_process",
    "cluster",
    "worker_threads",
    // Keep these as external dependencies (not bundled)
    "express",
    "helmet",
    "cors",
    "compression",
    "express-rate-limit",
    "pino",
    "pino-http",
    "prom-client",
    "zod",
  ],
  sourcemap: false,
  minify: true,
  treeShaking: true,
  metafile: true,
  logLevel: "info",
  // Preserve the shebang if present
  banner: {
    js: "#!/usr/bin/env node",
  },
};

async function buildBundle() {
  try {
    const result = await build(buildConfig);

    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => console.warn(warning));
    }
  } catch (error) {
    console.error("Build failed:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run the build if this script is executed directly
if (require.main === module) {
  console.log("Script executed directly, starting build...");
  buildBundle();
} else {
  console.log("Script imported as module");
}

module.exports = { buildConfig, buildBundle };
