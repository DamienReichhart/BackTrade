const { build } = require("esbuild");

build({
  entryPoints: ["src/server.js"],
  bundle: true,
  platform: "node",
  format: "cjs", // CommonJS
  target: "node24",
  outfile: "dist/server.bundle.js",
  external: [], // keep native imports
  minify: true,
  sourcemap: true
}).catch(() => process.exit(1));
