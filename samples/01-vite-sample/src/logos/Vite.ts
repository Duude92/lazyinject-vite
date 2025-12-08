import type {ILogo} from "../ILogo.ts";
import viteLogo from '/vite.svg'

export class Vite implements ILogo {
    get InnerHtml() {
        return `
      <a href="https://vite.dev" target="_blank">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
      </a>`
    }
}