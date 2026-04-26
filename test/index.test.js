import {
	afterEach,
	describe,
	it,
	mock,
} from 'node:test';
import {
	defaultMarkdownConfig,
	markdownRules,
} from '../index.js';
import {
	diffRules,
	fetchUpstreamRules,
	parseUpstreamRules,
} from './review-rules.js';
import assert from 'node:assert/strict';
import { eslintMarkdownRules } from '../src/eslint-markdown.js';
import markdown from '@eslint/markdown';

const validSeverities = new Set([
	'off',
	'warn',
	'error',
]);

function isValidSeverity(value) {
	if (Array.isArray(value)) {
		const [ severity ] = value;

		return Boolean(value.length) && validSeverities.has(severity);
	}

	return validSeverities.has(value);
}

const stripPrefix = (name) => name.replace(/^markdown\//, '');

const INTENTIONALLY_UNCONFIGURED_RULES = new Set([ 'fenced-code-meta' ]);

describe('markdownRules export shape', () => {
	it('is a non-empty array with a single config object', () => {
		const expectedLength = 1;

		assert.ok(Array.isArray(markdownRules));
		assert.equal(markdownRules.length, expectedLength);
	});

	it('exposes a non-empty rules object', () => {
		const [ { rules } ] = markdownRules;

		assert.equal(typeof rules, 'object');
		assert.notEqual(rules, null);
		assert.ok(Object.keys(rules).length);
	});
});

describe('defaultMarkdownConfig', () => {
	it('targets the expected glob', () => {
		assert.deepEqual(defaultMarkdownConfig.files, [ '**/*.md' ]);
	});

	it('declares the matching language', () => {
		assert.equal(defaultMarkdownConfig.language, 'markdown/gfm');
	});

	it('registers the @eslint/markdown plugin by identity', () => {
		assert.equal(defaultMarkdownConfig.plugins.markdown, markdown);
	});

	it('extends markdownRules by identity', () => {
		assert.equal(defaultMarkdownConfig.extends[0], markdownRules);
	});

	it('declares yaml frontmatter in languageOptions', () => {
		assert.equal(defaultMarkdownConfig.languageOptions.frontmatter, 'yaml');
	});

	it('exposes exactly files/plugins/language/extends/languageOptions keys', () => {
		assert.deepEqual(Object.keys(defaultMarkdownConfig).sort(), [
			'extends',
			'files',
			'language',
			'languageOptions',
			'plugins',
		]);
	});
});

describe('rule severities', () => {
	it('every rule uses a string severity (off/warn/error), not a numeric one', () => {
		const [ { rules } ] = markdownRules;
		const invalid = Object.entries(rules)
			.filter(([ , value ]) => !isValidSeverity(value))
			.map(([ name ]) => name);

		assert.deepEqual(invalid, []);
	});

	it('isValidSeverity accepts string forms and array forms starting with them', () => {
		assert.equal(isValidSeverity('off'), true);
		assert.equal(isValidSeverity('warn'), true);
		assert.equal(isValidSeverity('error'), true);
		assert.equal(isValidSeverity([ 'error' ]), true);
		assert.equal(isValidSeverity([ 'error', { option: true } ]), true);
	});

	it('isValidSeverity rejects numeric forms and unknown strings', () => {
		const off = 0;
		const warn = 1;
		const error = 2;
		const numericSeverities = [
			off,
			warn,
			error,
		];

		numericSeverities.forEach((severity) => {
			assert.equal(isValidSeverity(severity), false);
			assert.equal(isValidSeverity([ severity ]), false);
		});

		assert.equal(isValidSeverity('bogus'), false);
		assert.equal(isValidSeverity([]), false);
	});
});

describe('rule names are unique & well-formed', () => {
	it('every rule name is prefixed with markdown/', () => {
		const names = Object.keys(eslintMarkdownRules.rules);
		const unprefixed = names.filter((name) => !name.startsWith('markdown/'));

		assert.deepEqual(unprefixed, []);
	});

	it('rule names are unique within the source module', () => {
		const names = Object.keys(eslintMarkdownRules.rules);

		assert.equal(names.length, new Set(names).size);
	});

	it('index.js and eslint-markdown.js expose the same rule names', () => {
		const [ { rules: exported } ] = markdownRules;

		assert.deepEqual(
			Object.keys(exported).sort(),
			Object.keys(eslintMarkdownRules.rules).sort(),
		);
	});
});

describe('installed plugin drift (offline)', () => {
	it('every configured rule exists in the installed @eslint/markdown plugin', () => {
		const pluginRules = Object.keys(markdown.rules)
			.filter((name) => !INTENTIONALLY_UNCONFIGURED_RULES.has(name));
		const configRules = Object.keys(eslintMarkdownRules.rules).map(stripPrefix);
		const { missing, extra } = diffRules(configRules, pluginRules);

		assert.deepEqual(extra, [], `Extra in config (removed upstream?): ${extra.join(', ')}`);
		assert.deepEqual(missing, [], `Missing from config: ${missing.join(', ')}`);
	});
});

describe('upstream rule parser', () => {
	it('returns only .md file basenames, skipping directories and README', () => {
		const response = [
			{ name: 'no-bare-urls.md', type: 'file' },
			{ name: 'README.md', type: 'file' },
			{ name: 'nested', type: 'dir' },
			{ name: 'no-empty-links.md', type: 'file' },
			{ name: 'notes.txt', type: 'file' },
		];

		assert.deepEqual(parseUpstreamRules(response), [
			'no-bare-urls',
			'no-empty-links',
		]);
	});

	it('filters out intentionally-unconfigured rules', () => {
		const response = [
			{ name: 'fenced-code-language.md', type: 'file' },
			{ name: 'fenced-code-meta.md', type: 'file' },
		];

		assert.deepEqual(parseUpstreamRules(response), [ 'fenced-code-language' ]);
	});

	it('returns an empty array when given an empty list', () => {
		assert.deepEqual(parseUpstreamRules([]), []);
	});

	it('returns an empty array when no entry is a markdown file', () => {
		const response = [
			{ name: 'index.html', type: 'file' },
			{ name: 'scripts', type: 'dir' },
		];

		assert.deepEqual(parseUpstreamRules(response), []);
	});

	it('returns an empty array when given a non-array (e.g. error payload)', () => {
		assert.deepEqual(parseUpstreamRules({ message: 'Not Found' }), []);
	});
});

describe('diffRules', () => {
	it('returns empty missing/extra for identical sets', () => {
		const { missing, extra } = diffRules([ 'a', 'b' ], [ 'a', 'b' ]);

		assert.deepEqual(missing, []);
		assert.deepEqual(extra, []);
	});

	it('detects a rule missing from the config (upstream added a new rule)', () => {
		const { missing, extra } = diffRules([ 'a' ], [ 'a', 'b-new' ]);

		assert.deepEqual(missing, [ 'b-new' ]);
		assert.deepEqual(extra, []);
	});

	it('detects an extra rule in the config (upstream removed a rule)', () => {
		const { missing, extra } = diffRules([ 'a', 'b-removed' ], [ 'a' ]);

		assert.deepEqual(missing, []);
		assert.deepEqual(extra, [ 'b-removed' ]);
	});

	it('detects a renamed rule as one missing + one extra', () => {
		const { missing, extra } = diffRules([ 'a', 'b-old' ], [ 'a', 'b-new' ]);

		assert.deepEqual(missing, [ 'b-new' ]);
		assert.deepEqual(extra, [ 'b-old' ]);
	});

	it('deduplicates names via Set semantics', () => {
		const uniqueCount = 2;
		const { configRules, upstreamRules } = diffRules([
			'a',
			'a',
			'b',
		], [
			'a',
			'b',
			'b',
		]);

		assert.equal(configRules.size, uniqueCount);
		assert.equal(upstreamRules.size, uniqueCount);
	});
});

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const STEP_ONE = 1;
const ZERO = 0;
const COUNT_BELOW_MINIMUM = 5;
const COUNT_ABOVE_MINIMUM = 20;

function headersWithContentType(contentType) {
	return {
		get(name) {
			if (name.toLowerCase() === 'content-type') {
				return contentType;
			}

			return null;
		},
	};
}

function makeFetchResponse({
	body,
	contentType = 'application/json; charset=utf-8',
	isOk = true,
	status = HTTP_OK,
	statusText = 'OK',
}) {
	const headers = headersWithContentType(contentType);

	function json() {
		return Promise.resolve(body);
	}

	return {
		headers: headers,
		json: json,
		ok: isOk,
		status: status,
		statusText: statusText,
	};
}

function buildRulePayload(count) {
	const entries = [];

	for (let index = ZERO; index < count; index = index + STEP_ONE) {
		entries.push({ name: `r${index}.md`, type: 'file' });
	}

	return entries;
}

function stubFetchWith(response) {
	mock.method(globalThis, 'fetch', () => Promise.resolve(response));
}

describe('fetchUpstreamRules failure guards', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('throws when the upstream response is not ok', async () => {
		stubFetchWith(makeFetchResponse({
			body: [],
			isOk: false,
			status: HTTP_NOT_FOUND,
			statusText: 'Not Found',
		}));

		await assert.rejects(fetchUpstreamRules, /404 Not Found/v);
	});

	it('throws when the content-type is not application/json', async () => {
		stubFetchWith(makeFetchResponse({
			body: [],
			contentType: 'text/html',
		}));

		await assert.rejects(fetchUpstreamRules, /Unexpected content-type/v);
	});

	it('throws when the content-type header is missing', async () => {
		stubFetchWith(makeFetchResponse({
			body: [],
			contentType: null,
		}));

		await assert.rejects(fetchUpstreamRules, /Unexpected content-type/v);
	});

	it('throws when fewer than the minimum expected rules are parsed', async () => {
		stubFetchWith(makeFetchResponse({
			body: buildRulePayload(COUNT_BELOW_MINIMUM),
		}));

		await assert.rejects(fetchUpstreamRules, /Parsed only 5 rules/v);
	});
});

describe('fetchUpstreamRules happy path', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('returns the parsed rule list when the response is healthy', async () => {
		stubFetchWith(makeFetchResponse({
			body: buildRulePayload(COUNT_ABOVE_MINIMUM),
		}));

		const names = await fetchUpstreamRules();

		assert.equal(names.length, COUNT_ABOVE_MINIMUM);
		assert.equal(names[ZERO], 'r0');
	});
});

describe('upstream rules match config', () => {
	it('all upstream eslint/markdown rules are present in the config', async () => {
		const fetched = await fetchUpstreamRules();
		const configRules = Object.keys(eslintMarkdownRules.rules).map(stripPrefix);
		const { missing, extra } = diffRules(configRules, fetched);

		assert.deepEqual(missing, [], `Missing from config: ${missing.join(', ')}`);
		assert.deepEqual(extra, [], `Extra in config (removed upstream?): ${extra.join(', ')}`);
	});
});
