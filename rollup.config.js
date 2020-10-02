import babel from '@rollup/plugin-babel';

import pkg from './package.json';

export default [
	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'lib/index.js',
		external: ['react', 'react-dom'],
		output: [
			{ file: pkg.module, format: 'es' }
		],
		plugins: babel({
			exclude: 'node_modules/**',
			presets: ['@babel/preset-react']
		})
	}
];
