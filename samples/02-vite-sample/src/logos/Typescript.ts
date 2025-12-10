import type { ILogo } from '../ILogo.ts';
import typescriptLogo from '../typescript.svg';
import { Export } from '@duude92/lazyinject';

@Export('ILogo')
export class Typescript implements ILogo {
  get InnerHtml(): string {
    return `
      <a href="https://www.typescriptlang.org/" target="_blank">
        <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
      </a>`;
  }
}
