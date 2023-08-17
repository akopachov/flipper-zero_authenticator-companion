import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
    scss: {
      includePaths: ['node_modules/']
    }
  }),

	kit: {
		adapter: adapter({
			fallback: 'index.html',
		}),
		prerender: {
			crawl: false,
			entries: []
		}
	},
};

export default config;
