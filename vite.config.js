import { sveltekit } from '@sveltejs/kit/vite';
import renderer from 'vite-plugin-electron-renderer'

const config = {
	plugins: [
    sveltekit(),
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
