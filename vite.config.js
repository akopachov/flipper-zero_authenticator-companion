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
        'electron-log': { type: 'cjs' },
        'simple-electron-ipc': { type: 'cjs' },
      },
    })
  ],
  build: {
    target: 'esnext',
    modulePreload: { polyfill: false }
  }
};

export default config;
