const UPSTREAM_URL = 'https://api.github.com/repos/eslint/markdown/contents/docs/rules';
const IGNORED_BASENAMES = new Set([ 'README', 'index' ]);
const MIN_EXPECTED_RULES = 10;

/*
 * Rules that exist upstream but this package intentionally does not configure.
 * Listed here so the drift diff ignores them instead of failing, and so the
 * omission is explicit rather than silent.
 */
const INTENTIONALLY_UNCONFIGURED_RULES = new Set([ 'fenced-code-meta' ]);

export function parseUpstreamRules(apiResponse) {
	if (!Array.isArray(apiResponse)) {
		return [];
	}

	return apiResponse
		.filter((entry) => entry.type === 'file' && entry.name.endsWith('.md'))
		.map((entry) => entry.name.replace(/\.md$/, ''))
		.filter((name) => !IGNORED_BASENAMES.has(name))
		.filter((name) => !INTENTIONALLY_UNCONFIGURED_RULES.has(name))
		.sort();
}

export async function fetchUpstreamRules() {
	const response = await fetch(UPSTREAM_URL, {
		headers: {
			'Accept': 'application/vnd.github+json',
			'User-Agent': 'sheplu-eslint-config-markdown-drift',
		},
	});

	if (!response.ok) {
		throw new Error(`Upstream fetch failed: ${response.status} ${response.statusText}`);
	}

	const contentType = response.headers.get('content-type') ?? '';

	if (!contentType.includes('application/json')) {
		throw new Error(`Unexpected content-type from ${UPSTREAM_URL}: ${contentType}`);
	}

	const names = parseUpstreamRules(await response.json());

	if (names.length < MIN_EXPECTED_RULES) {
		const head = `Parsed only ${names.length} rules (expected >= ${MIN_EXPECTED_RULES})`;

		throw new Error(`${head} from ${UPSTREAM_URL} — upstream shape likely changed.`);
	}

	return names;
}

export function diffRules(configRuleNames, upstreamRuleNames) {
	const configRules = new Set(configRuleNames);
	const upstreamRules = new Set(upstreamRuleNames);
	const missing = [ ...upstreamRules ].filter((name) => !configRules.has(name));
	const extra = [ ...configRules ].filter((name) => !upstreamRules.has(name));

	return {
		configRules,
		extra,
		missing,
		upstreamRules,
	};
}
