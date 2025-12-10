import path from 'node:path';
import glob from 'fast-glob';
import { type Plugin, type ResolvedConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { transform } from 'esbuild';

export function viteLazyInject() {
  let rootDir: string = '';
  let resolvedFiles: string[] = [];

  return {
    name: 'vite-lazyinject',

    configResolved(config: ResolvedConfig) {
      rootDir = config.root;
    },

    async transform(code: string, id: string) {
      if (!code.includes('ContainerFactory.create')) return null;
      if (id.includes('node_modules')) return null;

      const indexRoot = path.dirname(id);
      const sourceDir = indexRoot ?? rootDir;
      const callMatch = code.match(/await ContainerFactory\.create\s*\(\s*({[\s\S]*?})\s*\)/);
      if (!callMatch) return null;

      const argsStr = callMatch[1];

      // extract catalogs
      const catalogsMatch = argsStr.match(/catalogs\s*:\s*\[([\s\S]*?)\]/);
      if (!catalogsMatch) return null;

      const catalogsStr = catalogsMatch[1];
      const pathRegex = /path\s*:\s*['"`](.*?)['"`]/g;

      const paths = [];
      let m;

      while ((m = pathRegex.exec(catalogsStr))) {
        paths.push(m[1]);
      }

      resolvedFiles = [];

      for (const rel of paths) {
        const absDir = path.resolve(sourceDir, rel);
        const files = await glob('**/*.ts', {
          cwd: absDir,
          absolute: true,
        });

        resolvedFiles.push(...files);
        const imports = resolvedFiles
          .map((file) => {
            let relative = '/' + path.relative(rootDir, file).replace(/\\/g, '/');
            return `import "injected:${relative}";\n`;
          })
          .join('');
        const isContainerDeclared = code.match(
          'import.+\\bContainer\\b.+from.+\\@duude92\\/lazyinject',
        );
        code =
          (isContainerDeclared?.index ? '' : `import {Container} from "@duude92/lazyinject";\n`) +
          imports.concat(code);
      }

      return {
        code: code.replace(callMatch[0], `new Container()`),
        map: null,
      };
    },
    resolveId(id, importer) {
      if (id.startsWith('injected:')) {
        return '\0' + id;
      }
      if (importer && importer.startsWith('\0injected:')) {
        const originalFilePath = importer.slice('\0injected:'.length);
        const originalDir = path.dirname(path.join(rootDir, originalFilePath));
        return path.resolve(originalDir, id);
      }
    },
    async load(id) {
      if (id.startsWith('\0injected:')) {
        const filePath = id.slice('\0injected:'.length);
        const fullPath = path.join(rootDir, filePath);
        const sourceCode = readFileSync(fullPath, 'utf-8');
        const transformedCode = await transform(sourceCode, {
          loader: 'ts',
          target: 'es2020',
          minify: false,
        });
        return transformedCode.code;
      }
    },
  } as Plugin;
}
