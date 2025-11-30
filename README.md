# @sheplu/eslint-config-markdown

A lightweight, opinionated ESLint configuration optimized for **Markdown** files.
This package helps you keep your Markdown clean, consistent, and free of common mistakes - especially when embedding code blocks or documenting APIs.

## Features

- Preconfigured ESLint rules for Markdown
- Zero-config: works out-of-the-box
- Supports ESLint v9 and Flat Config

## Installation

```bash
npm install --save-dev @sheplu/eslint-config-markdown
```

## Usage

```js
import { markdownRules } from "@sheplu/eslint-config-markdown";

export default defineConfig([
  {
    'extends': [ markdownRules ],
    'files': [ '**/*.md' ],
    'language': 'markdown/gfm',
    'plugins': { markdown },
  },
]);
```
