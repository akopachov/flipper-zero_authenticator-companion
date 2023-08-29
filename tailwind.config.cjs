const { skeleton } = require('@skeletonlabs/tw-plugin');

/** @type {import('tailwindcss').Config}*/
const config = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    require('path').join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
  ],
  darkMode: 'class',

  theme: {
    extend: {},
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    skeleton({ themes: { preset: ['skeleton'] } }),
  ],
};

module.exports = config;
