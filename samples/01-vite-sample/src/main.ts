import './style.css'
import {setupCounter} from './counter.ts'
import type {ILogo} from "./ILogo.ts";
import {Vite} from "./logos/Vite.ts";
import {Typescript} from "./logos/Typescript.ts";
import {ContainerFactory} from "@duude92/lazyinject";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="logos">
    </div>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`


setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
const container = await ContainerFactory.create({baseDir: '.', catalogs: [{path: 'logos'}]})
const logoArray = container.getMany<ILogo>()
const logos = document.querySelector<HTMLButtonElement>('#logos')
console.log(logoArray)

const addLogo = (logo: ILogo) => {
    if (!logos) return;
    logos.innerHTML += logo.InnerHtml;
}
addLogo(new Vite())
addLogo(new Typescript())