import { beforeEach, describe, expect, it } from 'vitest'

import { createStoredSearches } from '../src/storedSearches'
import type { DocSearchHit } from '../src/types'

const hit = (objectID: string): DocSearchHit => ({
  objectID,
  type: 'lvl1',
  url: `/guide/${objectID}`,
  hierarchy: { lvl0: 'Guide', lvl1: objectID },
  _highlightResult: {
    hierarchy: { lvl1: { value: `<mark>${objectID}</mark>` } }
  }
})

beforeEach(() => localStorage.clear())

describe('createStoredSearches', () => {
  it('stores recent hits without transient highlight metadata', () => {
    const searches = createStoredSearches('recent', 2, localStorage)

    searches.add(hit('first'))

    expect(searches.getAll()).toEqual([
      {
        objectID: 'first',
        type: 'lvl1',
        url: '/guide/first',
        hierarchy: { lvl0: 'Guide', lvl1: 'first' }
      }
    ])
  })

  it('moves duplicate hits to the front and enforces the limit', () => {
    const searches = createStoredSearches('recent', 2, localStorage)

    searches.add(hit('first'))
    searches.add(hit('second'))
    searches.add(hit('first'))
    searches.add(hit('third'))

    expect(searches.getAll().map((item) => item.objectID)).toEqual([
      'third',
      'first'
    ])
  })

  it('ignores malformed persisted values', () => {
    localStorage.setItem('recent', '{not valid json')

    expect(createStoredSearches('recent', 2, localStorage).getAll()).toEqual([])
  })
})
