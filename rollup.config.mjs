import { spawn } from 'child_process';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import smelte from "smelte/rollup-plugin-smelte.js";
import copy from 'rollup-plugin-copy'

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default [{
  input: 'src/main.js',
  external: ['serialport', 'electron'],
  output: {
    sourcemap: true,
    format: 'cjs',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production
      }
    }),

    smelte({ 
      purge: production,
      output: "public/global.css", // it defaults to static/global.css which is probably what you expect in Sapper 
      postcss: [], // Your PostCSS plugins
      whitelist: [], // Array of classnames whitelisted from purging
      whitelistPatterns: [], // Same as above, but list of regexes
      tailwind: { 
        colors: { 
          primary: "#b027b0",
          secondary: "#009688",
          error: "#f44336",
          success: "#4caf50",
          alert: "#ff9800",
          blue: "#2196f3",
          dark: "#212121" 
        }, // Object of colors to generate a palette from, and then all the utility classes
        darkMode: true, 
      },
      // Any other props will be applied on top of default Smelte tailwind.config.js
      }),

    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ 
      output: 'bundle.css'
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte', 'electron', 'serialport'],
      exportConditions: ['svelte']
    }),
    commonjs(),

    copy({
      targets: [
        { src: 'node_modules/@fontsource/roboto/files/**', dest: 'public/files'},
        { src: 'node_modules/@fontsource/material-icons/files/**', dest: 'public/files'}
      ]
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
}];
