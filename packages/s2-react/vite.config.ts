/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import react from '@vitejs/plugin-react';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';
import svgr from 'vite-plugin-svgr';
import { defineConfig, type LibraryFormats, type PluginOption } from 'vite';

const OUT_DIR_NAME_MAP: { [key in LibraryFormats]?: string } = {
  es: 'esm',
  cjs: 'lib',
  umd: 'dist',
};

const format = process.env.FORMAT as LibraryFormats;
const outDir = OUT_DIR_NAME_MAP[format];
const isUmdFormat = format === 'umd';

const isAnalysisMode = process.env.ANALYSIS;
const isDevMode = process.env.PLAYGROUND;
const root = path.join(__dirname, isDevMode ? 'playground' : '');

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  // 开发配置
  root,
  server: {
    port: 3000,
    hmr: true,
  },

  // 打包配置
  resolve: {
    mainFields: ['src', 'module', 'main'],
    alias: {
      lodash: 'lodash-es',
    },
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isDevMode ? 'development' : 'production',
    ),
  },

  plugins: [
    peerDepsExternal(),
    !isDevMode && viteCommonjs(),
    react({
      jsxRuntime: 'classic',
    }),
    svgr(),
    isAnalysisMode && visualizer({ gzipSize: true }),
  ].filter(Boolean) as PluginOption[],

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    modules: {
      // 样式小驼峰转化
      // css: goods-list => tsx: goodsList
      localsConvention: 'camelCase',
    },
  },

  build: {
    minify: isUmdFormat ? 'esbuild' : false,
    sourcemap: true,

    lib: {
      name: 'S2-React',
      entry: './src/index.ts',
      formats: [format],
    },
    outDir,

    rollupOptions: {
      output: {
        entryFileNames: `[name]${isUmdFormat ? '.min' : ''}.js`,
        assetFileNames: `[name]${isUmdFormat ? '.min' : ''}.[ext]`,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tant/s2': 'S2',
        },
      },
    },
  },
});
