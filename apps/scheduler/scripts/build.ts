import { build } from "esbuild";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        await build({
            entryPoints: ["src/scheduler.ts"],
            bundle: true,
            platform: "node",
            outfile: "dist/scheduler.js",
            format: "esm",
            target: "node24",
            banner: {
                js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
            },
            define: {
                __dirname: "import.meta.url",
                __filename: "import.meta.url",
            },
            external: [],
        });

        // eslint-disable-next-line no-console
        console.log("Build completed successfully.");
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Build failed.", error);
        // Using exitCode avoids forcing an immediate exit and plays nicer with parent processes.
        process.exitCode = 1;
    }
}

void main();
