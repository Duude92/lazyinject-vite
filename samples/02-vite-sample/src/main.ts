import './style.css';
import { setupCounter } from './counter.ts';
import type { ILogo } from './ILogo.ts';
import { ContainerFactory } from '@duude92/lazyinject';

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
`;
setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);
const container = await ContainerFactory.create();
const logoArray = container.getMany<ILogo>('ILogo');
const logos = document.querySelector<HTMLButtonElement>('#logos');

const addLogo = (logo: ILogo) => {
  if (!logos) return;
  logos.innerHTML += logo.InnerHtml;
};
logoArray?.forEach((item) => {
  addLogo(item);
});
