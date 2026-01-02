import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { eslintMarkdownRules } from '../eslint-markdown.js';

/* eslint-disable @stylistic/curly-newline */
describe('Rules', () => {
	it('has the same number of rules', () => {
		// temporary remove one rule count for fenced-code-meta
		const fetchedRules = readdirSync('./remote/docs/rules').length - 1;
		const rules = Object.keys(eslintMarkdownRules.rules).length;

		assert.equal(rules, fetchedRules);
	});

	it('has the same rules', () => {
		// remove rule while not published
		const fetchedRules = readdirSync('./remote/docs/rules')
			.map((item) => item.replace('.md', ''))
			.filter((item) => item !== 'fenced-code-meta');
		const rules = Object.keys(eslintMarkdownRules.rules)
			.map((item) => item.replace('markdown/', ''));

		assert.deepEqual(rules, fetchedRules);
	});
});
/* eslint-enable @stylistic/curly-newline */
