# AGENTS.md

Instructions for coding agents working in this repository.

## Project overview

`@sheplu/eslint-config-markdown` is a flat-config ESLint configuration for Markdown files. It wraps [`@eslint/markdown`](https://github.com/eslint/markdown) and ships every non-deprecated upstream rule explicitly configured, so nothing is left to defaults. A scheduled CI job diffs the config against the upstream rule list and opens an issue on drift.

- Entry point: `index.js`
- Two exports:
    - `markdownRules` — array of flat-config objects (rule bundle only; supply your own `files` / `plugins` / `language`).
    - `defaultMarkdownConfig` — ready-to-drop-in flat-config object for `**/*.md` (GFM, YAML frontmatter).
- Rule source: `src/eslint-markdown.js` (single category — `@eslint/markdown` is a flat rule list, not grouped).
- Tests in `test/` (Node built-in `node:test`, no framework).
- Drift check: `test/review-rules.js` + the upstream assertion in `test/index.test.js`.

## Environment

- Node `>= 24` (uses `node --test --experimental-test-coverage`).
- ESLint `>= 10` (flat config only).
- `@eslint/markdown >= 8` (peer dependency).
- ESM: `"type": "module"` — use `import`/`export`, no CommonJS.
- Git hooks: `.npmrc` sets `ignore-scripts=true`, so `npm ci` does **not** wire hooks automatically. Run `npm run setup:hooks` once after cloning to point `core.hooksPath` at `.githooks/` (pre-commit and pre-push run lint/tests locally).

## Commands

```sh title="commands"
npm ci                   # install dependencies
npm run setup:hooks      # wire .githooks/ as core.hooksPath (run once after cloning)
npm test                 # node --test (includes live upstream drift check — needs network)
npm run test:coverage    # same, with 100% line/branch/function coverage enforced
npm run lint             # eslint .
npm run lint:fix         # eslint . --fix
npm audit                # must pass with zero advisories (see CI)
```

The upstream drift test in `test/index.test.js` fetches `api.github.com` at runtime. It will fail without network access — that is expected, not a bug to "fix" by mocking.

## AI tooling (apkg)

This repo uses [`apkg`](https://apkg.ai) to distribute AI-tooling assets (agent rules, prompts, etc.) without committing vendor-specific files to the tree. The manifest is `apkg.json` and the lockfile is `apkg-lock.json` — both are committed.

Tooling directories are **gitignored** and provisioned on demand:

- `.codex/`, `.claude/`, `.cursor/`, `CLAUDE.md`, and `apkg_packages/` are ignored (see `.gitignore`).
- CI runs `apkg-ai/setup-apkg` in `.github/workflows/quality-gates.yaml` with `--frozen-lockfile` before the test step, so workflow-authoring rules are present when tests run.
- Locally, if you contribute using an AI agent and want these rule files materialized, install `apkg` and run its install command against this repo — see the upstream docs. The `<!-- apkg:rules -->` block below is maintained by `apkg` and points at paths that only exist after installation.

## Code style

- Tabs for indentation (width 4), LF line endings, single quotes, final newline. See `.editorconfig`.
- Linted by the package's own config plus `@sheplu/eslint-config` stylistic rules — run `npm run lint` before proposing changes.
- Rule severities must be strings (`'off' | 'warn' | 'error'`), never numeric. A test enforces this.
- Prefer explicit rule configuration with spelled-out options over shorthand — the whole point of this package is that nothing is implicit.
- The package dogfoods its own config: `eslint.config.js` applies `markdownRules` to every `**/*.md` file in the repo.

## When adding or changing rules

1. Add the rule to `src/eslint-markdown.js` with explicit options.
2. Keep every rule at `error` with spelled-out options unless there is a clear reason otherwise.
3. Run `npm test` — the upstream diff will catch renamed/removed rules, the offline plugin-drift test will catch rules missing from the installed `@eslint/markdown`.

## CI quality gates

`.github/workflows/quality-gates.yaml` runs on every push to `main` and every PR:

1. `npm ci`.
2. `npm audit` — **must pass with no advisories**. Do not add `--audit-level` to filter findings; fix or upgrade the offending dependency instead.
3. `npm run lint`.
4. `apkg-ai/setup-apkg` — installs AI-tooling assets from `apkg-lock.json` (`--frozen-lockfile`).
5. `npm run test:coverage` — coverage thresholds are 100% for lines, branches, and functions.

A separate weekly workflow (`eslint-rules-drift.yaml`) runs the upstream diff and opens an issue on drift.

## Pull requests

- Keep changes focused; no drive-by refactors in rule-change PRs.
- Commit style follows conventional-ish prefixes used in history (`feat:`, `fix:`, `chore:`, `doc:`).
- Update `README.md` if user-facing behavior changes; do not create other docs unless asked.

<!-- apkg:rules -->
<!-- /apkg:rules -->
