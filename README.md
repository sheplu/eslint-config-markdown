# @sheplu/eslint-config-markdown

[![npm version](https://img.shields.io/npm/v/@sheplu/eslint-config-markdown.svg)](https://www.npmjs.com/package/@sheplu/eslint-config-markdown)
[![quality gates](https://img.shields.io/github/actions/workflow/status/sheplu/eslint-config-markdown/quality-gates.yaml?branch=main&label=quality%20gates)](https://github.com/sheplu/eslint-config-markdown/actions/workflows/quality-gates.yaml?query=branch%3Amain)
[![upstream drift](https://img.shields.io/github/actions/workflow/status/sheplu/eslint-config-markdown/eslint-rules-drift.yaml?label=upstream%20drift)](https://github.com/sheplu/eslint-config-markdown/actions/workflows/eslint-rules-drift.yaml)
[![license](https://img.shields.io/npm/l/@sheplu/eslint-config-markdown.svg)](./LICENSE)

Opinionated, exhaustive configuration for [`@eslint/markdown`](https://github.com/eslint/markdown) — ready to drop into an ESLint 10+ flat config for Markdown files.

Every non-deprecated upstream rule is configured explicitly, so nothing is left to defaults and nothing silently changes when `@eslint/markdown` ships a new rule — a scheduled CI job diffs the package against the upstream rule index every week and opens an issue on drift.

## Installation

```sh
npm install --save-dev @sheplu/eslint-config-markdown eslint @eslint/markdown
```

Requires `eslint >= 10` (flat config), `@eslint/markdown >= 8`, and Node `>= 24`.

## Usage

The drop-in `defaultMarkdownConfig` wires the plugin, the language (GFM, YAML frontmatter), and the rules in one object:

```js
import { defineConfig } from 'eslint/config';
import { defaultMarkdownConfig } from '@sheplu/eslint-config-markdown';

export default defineConfig([
    defaultMarkdownConfig,
]);
```

Or use `markdownRules` on its own if you want to supply your own `files` glob, `plugins`, or `language`:

```js
import { defineConfig } from 'eslint/config';
import markdown from '@eslint/markdown';
import { markdownRules } from '@sheplu/eslint-config-markdown';

export default defineConfig([
    {
        files: [ '**/*.md' ],
        plugins: { markdown },
        language: 'markdown/gfm',
        extends: [ markdownRules ],
    },
]);
```

## Exports

| Export                  | Type                | Purpose                                                                                 |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `markdownRules`         | `Linter.Config[]`   | Rule bundle only — bring your own `files`/`plugins`/`language`.                         |
| `defaultMarkdownConfig` | `Linter.Config`     | Ready-to-use flat-config object for `**/*.md` (GFM, YAML frontmatter) — supply the plugin. |

Every rule is set to `error` with options spelled out explicitly. If you need a more permissive baseline, override rules individually in your own config.

One rule upstream is intentionally not configured (`fenced-code-meta`) because it is not actively wanted in this package's baseline. If you do want it, enable it in your own config.

## Scripts

```sh
npm test                 # run the test suite (includes upstream drift check)
npm run test:coverage    # run tests with coverage
npm run lint             # lint the package itself
npm run lint:fix         # lint with autofix
npm run setup:hooks      # wire .githooks/ as the git hooks path (run once)
```

## Upstream drift

`test/review-rules.js` fetches the [`eslint/markdown` rule docs index](https://github.com/eslint/markdown/tree/main/docs/rules) via the GitHub contents API and diffs it against the configured rule set. This runs:

- as part of `npm test`,
- on a weekly schedule (`.github/workflows/eslint-rules-drift.yaml`), which opens a GitHub issue if new rules appear, are renamed, or are removed upstream.

## Contributing

See `AGENTS.md` for the short version of how this repo is laid out and the CI quality gates. A few things worth knowing up front:

- Git hooks live in `.githooks/`. Run `npm run setup:hooks` once after cloning to point `core.hooksPath` there. The pre-commit hook runs lint and tests; the pre-push hook adds coverage and `npm audit`, and blocks direct pushes to `main`. (Hooks are opt-in because `.npmrc` sets `ignore-scripts=true` for supply-chain safety.)
- AI tooling assets (agent rules, prompts) are distributed via [`apkg`](https://apkg.ai) rather than committed. `apkg.json` and `apkg-lock.json` are in the repo; the resolved files under `.codex/`, `.claude/`, `.cursor/`, etc. are gitignored and materialized by running `apkg` install. CI does this automatically in `quality-gates.yaml`. If you contribute using an AI agent and want those rule files locally, install `apkg` and run it against this repo.
