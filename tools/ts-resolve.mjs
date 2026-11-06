/**
 * Lets plain `node` run the TypeScript in `src/` and `tools/`.
 *
 * Node 22 strips types on its own, but it does not read tsconfig, so two
 * things need help: the `@/*` path alias used throughout `src/`, and
 * extensionless import specifiers. This resolve hook supplies both, so the
 * client-email generator can import the same modules the website imports
 * instead of keeping a second copy of the firm's details.
 *
 * Usage: node --import ./tools/ts-resolve.mjs tools/draft-email.ts
 */
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* Type stripping is on by default from Node 22.18; the website itself still
   builds on Node 18, so only this tool needs the newer runtime. */
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(
    `This tool needs Node 22.18 or newer (you have v${process.versions.node}).\n` +
      'The website itself still builds on Node 18; only this tool needs the newer runtime.',
  );
  process.exit(1);
}

const SRC = new URL('../src/', import.meta.url);

/** The first of `base`, `base.ts`, `base/index.ts` that exists on disk. */
function withExtension(url) {
  const path = fileURLToPath(url);
  for (const candidate of [path, `${path}.ts`, `${path}/index.ts`]) {
    if (!candidate.endsWith('/') && existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return undefined;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    const base = specifier.startsWith('@/')
      ? new URL(specifier.slice(2), SRC)
      : specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier) && context.parentURL
        ? new URL(specifier, context.parentURL)
        : undefined;

    if (base) {
      const url = withExtension(base);
      if (url) return { url, shortCircuit: true, format: 'module-typescript' };
    }
    return nextResolve(specifier, context);
  },
});
