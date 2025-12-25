import path from 'node:path';
import fs from 'node:fs';
import glob from 'fast-glob';
import { PluginOption, type ResolvedConfig } from 'vite';
import { readFileSync } from 'node:fs';

const VIRTUAL_ID = 'lazyinject:modules';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

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
      const emptyContainer = code.match(/await ContainerFactory\.create\s*\(\s*\)/);
      let catalogsStr = '';
      if (!emptyContainer) {
        const callMatch = code.match(/await ContainerFactory\.create\s*\(\s*({[\s\S]*?})\s*\)/);
        if (!callMatch) {
          return null;
        }
        code = code.replace(callMatch[0], `new Container()`);
        const argsStr = callMatch[1];
        // extract catalogs
        const catalogsMatch = argsStr.match(/catalogs\s*:\s*\[([\s\S]*?)]/);
        if (!catalogsMatch) return null;
        catalogsStr = catalogsMatch[1];
      } else {
        code = code.replace(emptyContainer[0], `new Container()`);

        const configFile = 'lazyinject.config.js';
        const configPath = path.join(rootDir, configFile);

        if (!fs.existsSync(configPath)) return null;

        const config = readFileSync(configPath, 'utf8');
        const configMatch = config.match(/catalogs:\s*\[(.+)]/);

        catalogsStr = configMatch ? configMatch[1] : '{ path: \".\" }';
      }

      const pathRegex = /path\s*:\s*['"`](.*?)['"`]/g;

      const paths = [];
      let m;

      while ((m = pathRegex.exec(catalogsStr))) {
        paths.push(m[1]);
      }

      resolvedFiles = [];
      const isContainerDeclared = code.match(
        'import.+\\bContainer\\b.+from.+\\@duude92\\/lazyinject',
      );
      code = isContainerDeclared?.index
        ? ''
        : `import {Container} from "@duude92/lazyinject";\n` + code;
      for (const rel of paths) {
        const absDir = path.resolve(sourceDir, rel);
        const files = await glob('**/*.ts', {
          cwd: absDir,
          absolute: true,
        });

        resolvedFiles.push(...files);
      }
      code += `\nimport "${VIRTUAL_ID}";\n`;

      return {
        code,
        map: null,
      };
    },
    resolveId(id, importer) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_ID;
      }
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;

      const imports = await Promise.all(
        resolvedFiles.map(async (file, i) => {
          const resolved = await this.resolve(file, undefined, {
            skipSelf: true,
          });

          if (!resolved) {
            throw new Error(`Failed to resolve ${file}`);
          }

          return `import * as m${i} from ${JSON.stringify(resolved.id)};`;
        }),
      );

      return `
    ${imports.join('\n')}
    export default [${resolvedFiles.map((_, i) => `m${i}`).join(', ')}];`;
    },
  } as PluginOption;
}
