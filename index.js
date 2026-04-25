import { eslintMarkdownRules } from './src/eslint-markdown.js';

export const markdownRules = [
	{
		rules: {
			...eslintMarkdownRules.rules,
		},
	},
];

export const defaultMarkdownConfig = {
	'files': [ '**/*.md' ],
	'language': 'markdown/gfm',
	'extends': [ markdownRules ],
	'languageOptions': {
		frontmatter: 'yaml',
	},
};
