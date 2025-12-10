import type { ILogo } from '../ILogo.ts';
import viteLogo from '/vite.svg';
import { Export } from '@duude92/lazyinject';

@Export('ILogo')
export class Vite implements ILogo {
  constructor() {}

  get InnerHtml() {
    return `
      <a href="https://vite.dev" target="_blank">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
      </a>`;
  }
}
