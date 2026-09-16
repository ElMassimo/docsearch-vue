import { describe, expect, it } from 'vitest'

import { normalizeOptions } from '../src/normalizeOptions'
import type { DocSearchOptions } from '../src/types'

describe('normalizeOptions', () => {
  it('preserves native DocSearch 5 indices', () => {
    const options = normalizeOptions({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: [
        'primary',
        {
          name: 'secondary',
          searchParameters: { facetFilters: ['lang:en'] }
        }
      ]
    })

    expect(options.indices).toEqual([
      { name: 'primary' },
      {
        name: 'secondary',
        searchParameters: { facetFilters: ['lang:en'] }
      }
    ])
  })

  it('converts the VitePress indexName contract into a DocSearch 5 index', () => {
    const options = normalizeOptions({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indexName: 'docs',
      searchParameters: { facetFilters: ['lang:en'] }
    })

    expect(options.indices).toEqual([
      {
        name: 'docs',
        searchParameters: { facetFilters: ['lang:en'] }
      }
    ])
  })

  it('rejects options that mix native and legacy index configuration', () => {
    expect(() =>
      normalizeOptions({
        appId: 'app',
        apiKey: 'key',
        container: '#docsearch',
        indices: ['docs'],
        indexName: 'legacy'
      } as unknown as DocSearchOptions)
    ).toThrow('Pass either `indices` or `indexName`, not both.')
  })

  it('requires at least one index', () => {
    expect(() =>
      normalizeOptions({
        appId: 'app',
        apiKey: 'key',
        container: '#docsearch',
        indices: []
      })
    ).toThrow('Must supply at least one `indices` entry for DocSearch.')
  })
})
