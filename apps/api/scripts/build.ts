import { build } from 'esbuild';

async function main() {
  try {
    await build({
      entryPoints: ['src/server.ts'],
      bundle: true,
      platform: 'node',
      outfile: 'dist/server.js',
      format: 'esm',
      target: 'node24',
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
      define: {
        __dirname: 'import.meta.url',
        __filename: 'import.meta.url',
      },
      external: ['argon2'],
    });

    // eslint-disable-next-line no-console
    console.log('Build completed successfully.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Build failed.', error);
    // Using exitCode avoids forcing an immediate exit and plays nicer with parent processes.
    // eslint-disable-next-line no-process-exit
    process.exitCode = 1;
  }
}

void main();


