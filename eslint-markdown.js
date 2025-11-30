export const eslintMarkdownRules = {
	rules: {
		'markdown/fenced-code-language': [
			'error',
			{
				required: [],
			},
		],
		'markdown/heading-increment': [
			'error',
			{
				frontmatterTitle: '^(?!\\s*[\'"]title[:=][\'"])\\s*\\{?\\s*[\'"]?title[\'"]?\\s*[:=]',
			},
		],
		'markdown/no-bare-urls': [ 'error' ],
		'markdown/no-duplicate-definitions': [
			'error',
			{
				allowDefinitions: [ '//' ],
				allowFootnoteDefinitions: [],
			},
		],
		'markdown/no-duplicate-headings': [
			'error',
			{
				checkSiblingsOnly: false,
			},
		],
		'markdown/no-empty-definitions': [
			'error',
			{
				allowDefinitions: [ '//' ],
				allowFootnoteDefinitions: [ 'note' ],
				checkFootnoteDefinitions: true,
			},
		],
		'markdown/no-empty-images': [ 'error' ],
		'markdown/no-empty-links': [ 'error' ],
		'markdown/no-html': [
			'error',
			{
				allowed: [],
				allowedIgnoreCase: false,
			},
		],
		'markdown/no-invalid-label-refs': [ 'error' ],
		'markdown/no-missing-atx-heading-space': [
			'error',
			{
				checkClosedHeadings: true,
			},
		],
		'markdown/no-missing-label-refs': [
			'error',
			{
				allowLabels: [],
			},
		],
		'markdown/no-missing-link-fragments': [
			'error',
			{
				allowPattern: '',
				ignoreCase: false,
			},
		],
		'markdown/no-multiple-h1': [
			'error',
			{
				frontmatterTitle: '',
			},
		],
		'markdown/no-reference-like-urls': [ 'error' ],
		'markdown/no-reversed-media-syntax': [ 'error' ],
		'markdown/no-space-in-emphasis': [
			'error',
			{
				checkStrikethrough: true,
			},
		],
		'markdown/no-unused-definitions': [
			'error',
			{
				allowDefinitions: [],
				allowFootnoteDefinitions: [],
			},
		],
		'markdown/require-alt-text': [ 'error' ],
		'markdown/table-column-count': [
			'error',
			{
				checkMissingCells: true,
			},
		],
	},
};
