import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      scss: {
        includePaths: ['node_modules/'],
      },
    }),
    vitePreprocess({}),
  ],

  vitePlugin: {
		inspector: true,   
	},

  kit: {
    adapter: adapter({
      fallback: 'index.html',
    }),
    alias: {
      $components: 'src/components',
      $models: 'src/models',
      $stores: 'src/stores',
    },
    prerender: {
      crawl: false,
      entries: [],
    },
  },
};

export default config;
