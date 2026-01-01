import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from "node:fs";
import { eslintMarkdownRules } from '../eslint-markdown.js';

describe('Rules', () => {
	it('has the same number of rules', () => {
		const fetchedRules = readdirSync('./remote/docs/rules').length;
		const rules = Object.keys(eslintMarkdownRules.rules).length;
		assert.equal(rules, fetchedRules);
	});

	it('has the same rules', () => {
		const fetchedRules = readdirSync('./remote/docs/rules').map(item => item.replace('.md', ''));
		const rules = Object.keys(eslintMarkdownRules.rules).map(item => item.replace('markdown/', ''));

		assert.deepEqual(rules, fetchedRules);
	});
});
