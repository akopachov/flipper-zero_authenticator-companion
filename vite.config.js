import { sveltekit } from '@sveltejs/kit/vite';
import renderer from 'vite-plugin-electron-renderer'
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

const config = {
	plugins: [
    sveltekit(),
    purgeCss(),
    renderer({
      resolve: {
        // C/C++ modules must be pre-bundle
        serialport: { type: 'cjs' },
        'node-screenshots': { type: 'cjs' },
        'electron-log': { type: 'cjs' }
      },
    })
  ],
  build: {
    target: 'esnext',
    modulePreload: { polyfill: false }
  }
};

export default config;
