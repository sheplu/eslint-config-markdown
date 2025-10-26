import { eslintMarkdownRules } from './eslint-markdown.js';

export const markdownRules = [
	{
		rules: {
			...eslintMarkdownRules.rules,
		},
	},
];
