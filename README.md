# lazyinject-vite

Vite plugin designed to bundle application which uses [LazyInject DI](https://github.com/Duude92/lazyinject)
container.

## Installation

```bash
npm install @duude92/lazyinject-vite --save-dev
```

## Quick start

- Setup `lazyinject.config.js` with catalogs, which has dependencies.<br>
  Example:

```js
// lazyinject.config.js
module.exports = {
    catalogs: ['src', 'src/implementations'],
};
```
- Setup vite plugin within your vite.config.ts:
```
export default defineConfig({
    plugins: [viteLazyInject()],
});
```

## Example
- `01-vite-sample` contain example of web application, which uses LazyInject as DI container, bundled using vite

## License
This project is open source and available under the MIT License.

## Contributing
Contributions are welcome! Please feel free to submit issues and pull requests.