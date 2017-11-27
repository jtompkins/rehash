import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'cjs',
    },
    {
      file: 'dist/bundle.es.js',
      format: 'es',
    },
  ],
  sourcemap: true,
  external: ['react', 'react-dom', 'prop-types'],
  plugins: [
    resolve({ extensions: ['.js', '.jsx'] }),
    commonjs(),
    babel(),
    uglify({}, minify),
  ],
}
