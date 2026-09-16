# @mussi/docsearch-vue

A Vue 3 implementation of the [DocSearch 5](https://docsearch.algolia.com/) keyword-search experience. It preserves DocSearch's `.DocSearch-*` markup and styles and can replace the DocSearch integration bundled with VitePress.

This package does not depend on React, Preact, `@docsearch/react`, or the DocSearch AI runtime.

## Install

```sh
pnpm add @mussi/docsearch-vue vue
```

Vue `3.5.13` or newer is required. Vue `3.6.0-rc.8` is supported.

## Use directly

```ts
import docsearch from '@mussi/docsearch-vue'
import '@mussi/docsearch-vue/style'

const search = docsearch({
  container: '#docsearch',
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
  indices: ['YOUR_INDEX_NAME']
})

search.open()
```

`indices` also accepts index-specific search parameters:

```ts
docsearch({
  container: '#docsearch',
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
  indices: [
    {
      name: 'docs',
      searchParameters: { facetFilters: ['language:en'] }
    }
  ]
})
```

The returned instance exposes `open()`, `close()`, `destroy()`, `isOpen`, and `isReady`.

## Replace VitePress DocSearch

VitePress loads `@docsearch/js` and `@docsearch/css` dynamically. Alias both modules to this package:

```ts
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@docsearch/js': '@mussi/docsearch-vue',
        '@docsearch/css': '@mussi/docsearch-vue/style'
      }
    }
  },
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'YOUR_INDEX_NAME'
      }
    }
  }
})
```

The compatibility adapter converts VitePress's legacy `indexName` and `searchParameters` options into the DocSearch 5 `indices` format.

## Supported experience

- DocSearch 5 keyword search and multi-index queries
- Hierarchical hits, highlighting, snippets, and keyboard navigation
- Loading, error, empty, no-results, and result screens
- Recent and pinned searches with optional personalization disablement
- Focus trapping, global shortcuts, mobile viewport handling, and focus restoration
- DocSearch translations, lifecycle callbacks, `transformItems`, `transformSearchClient`, custom navigation, and missing-results links
- VitePress's legacy Algolia option shape

Ask AI, side panels, local search, and React/Preact component exports are intentionally outside this package's scope.

## License

MIT. See [NOTICE](./NOTICE) for third-party attribution.
