import { defaultMarkdownConfig } from './index.js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticRules from '@sheplu/eslint-config/src/stylistic.js';

export default defineConfig([
	{
		'extends': [
			'js/recommended',
			stylisticRules,
		],
		'files': [ '**/*.{js,mjs,cjs}' ],
		'languageOptions': {
			globals: globals.node,
		},
		'plugins': { '@stylistic': stylistic, js },
		'rules': {
			'@stylistic/curly-newline': 'warn',
		},
	},
	defaultMarkdownConfig,
]);
