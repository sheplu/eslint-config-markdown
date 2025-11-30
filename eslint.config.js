import { defineConfig } from 'eslint/config';
import eslintRules from '@sheplu/eslint-config/src/eslint.js';
import globals from 'globals';
import js from '@eslint/js';
import markdown from '@eslint/markdown';
import { markdownRules } from './index.js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticRules from '@sheplu/eslint-config/src/stylistic.js';

// eslint-disable-next-line no-restricted-exports
export default defineConfig([
	{
		'extends': [
			'js/recommended',
			eslintRules,
			stylisticRules,
		],
		'files': ['**/*.{js,mjs,cjs}'],
		'languageOptions': {
			globals: globals.node,
		},
		// eslint-disable-next-line object-shorthand
		'plugins': { '@stylistic': stylistic, js },
		'rules': {
		},
	},
	{
		'files': [ '**/*.md' ],
		'plugins': { markdown },
		'language': 'markdown/gfm',
		'extends': [ markdownRules ],
		languageOptions: {
			frontmatter: "yaml",
		},
	},
]);
