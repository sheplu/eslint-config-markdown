import { eslintMarkdownRules } from './src/eslint-markdown.js';
import markdown from '@eslint/markdown';

export const markdownRules = [
	{
		rules: {
			...eslintMarkdownRules.rules,
		},
	},
];

export const defaultMarkdownConfig = {
	'files': [ '**/*.md' ],
	'plugins': { markdown },
	'language': 'markdown/gfm',
	'extends': [ markdownRules ],
	'languageOptions': {
		frontmatter: 'yaml',
	},
};
