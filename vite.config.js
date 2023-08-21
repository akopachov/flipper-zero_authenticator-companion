import { sveltekit } from '@sveltejs/kit/vite';
import { nodeExternals } from 'rollup-plugin-node-externals';
import renderer from 'vite-plugin-electron-renderer'

const config = {
	plugins: [
    {...nodeExternals({ builtinsPrefix:'ignore' }), enforce: 'pre'},
    sveltekit(),
    renderer({
      resolve: {
        // C/C++ modules must be pre-bundle
        serialport: { type: 'cjs' },
        'node-screenshots': { type: 'cjs' }
      },
    })
  ],
  build: {
    target: 'esnext',
    modulePreload: { polyfill: false },
    rollupOptions: {
      external: [
        'serialport',
        'node-screenshots',
        'electron',
      ],
    },
  }
};

export default config;
