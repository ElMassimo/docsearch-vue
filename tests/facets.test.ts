import { describe, expect, it } from 'vitest'

import {
  createFacetFilters,
  deriveFacetSelections,
  getFacetLabel,
  normalizeFacets
} from '../src/facets'

describe('facets', () => {
  it('normalizes unique facet keys and limits the controls to five', () => {
    expect(normalizeFacets([
      { key: ' Language ' },
      { key: 'language', label: 'Duplicate' },
      { key: '' },
      { key: 'version' },
      { key: 'framework' },
      { key: 'area' },
      { key: 'product' },
      { key: 'ignored' }
    ])).toEqual([
      { key: 'language' },
      { key: 'version' },
      { key: 'framework' },
      { key: 'area' },
      { key: 'product' }
    ])
  })

  it('creates a readable label when no label is configured', () => {
    expect(getFacetLabel({ key: 'docusaurus_tag' })).toBe('Docusaurus Tag')
    expect(getFacetLabel({ key: 'language', label: 'Language version' })).toBe(
      'Language version'
    )
  })

  it('derives default selections from configured facet filters', () => {
    expect(deriveFacetSelections([
      {
        name: 'docs',
        searchParameters: {
          facetFilters: [
            'language:en',
            ['version:v4', 'version:v5'],
            ['language:en', 'version:v5']
          ]
        }
      }
    ])).toEqual({ language: ['en'], version: ['v4', 'v5'] })
  })

  it('replaces configured filters for facets selected by the user', () => {
    expect(createFacetFilters(
      ['language:en', 'product:docs'],
      { language: ['fr', 'de'], version: ['v5'], empty: [] }
    )).toEqual([
      'product:docs',
      ['language:fr', 'language:de'],
      'version:v5'
    ])
  })
})
