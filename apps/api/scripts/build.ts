import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively copy a directory from source to destination
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
    await fs.promises.mkdir(dest, { recursive: true });

    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.promises.copyFile(srcPath, destPath);
        }
    }
}

async function main() {
    try {
        await build({
            entryPoints: ["src/server.ts"],
            bundle: true,
            platform: "node",
            outfile: "dist/server.js",
            format: "esm",
            target: "node24",
            banner: {
                js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
            },
            define: {
                __dirname: "import.meta.url",
                __filename: "import.meta.url",
            },
            external: [
                "argon2",
                "mjml",
                "mjml-core",
                "html-minifier",
                "uglify-js",
                "@prisma/client",
                "@prisma/adapter-pg",
            ],
        });

        // Copy email templates to dist folder
        const templatesSrc = path.join(
            __dirname,
            "..",
            "src",
            "email",
            "templates"
        );
        const templatesDest = path.join(__dirname, "..", "dist", "templates");

        await copyDirectory(templatesSrc, templatesDest);

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
