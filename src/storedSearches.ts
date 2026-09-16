import type { DocSearchHit } from './types'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface StoredSearches {
  add(item: DocSearchHit): void
  remove(item: DocSearchHit): void
  getAll(): DocSearchHit[]
}

function isStoredHit(value: unknown): value is DocSearchHit {
  if (typeof value !== 'object' || value === null) return false
  const hit = value as Record<string, unknown>

  return (
    typeof hit.objectID === 'string' &&
    typeof hit.type === 'string' &&
    typeof hit.url === 'string' &&
    typeof hit.hierarchy === 'object' &&
    hit.hierarchy !== null
  )
}

function read(storage: StorageLike, key: string, limit: number): DocSearchHit[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value.filter(isStoredHit).slice(0, limit) : []
  } catch {
    return []
  }
}

export function createStoredSearches(
  key: string,
  limit = 5,
  storage: StorageLike = localStorage
): StoredSearches {
  let items = read(storage, key, limit)

  function persist(): void {
    try {
      storage.setItem(key, JSON.stringify(items))
    } catch {
      // Search remains functional when storage is unavailable or full.
    }
  }

  return {
    add(item) {
      const {
        _highlightResult: _discardedHighlight,
        _snippetResult: _discardedSnippet,
        __docsearch_parent: _discardedParent,
        ...storedHit
      } = item

      items = [
        storedHit,
        ...items.filter((saved) => saved.objectID !== storedHit.objectID)
      ].slice(0, limit)
      persist()
    },
    remove(item) {
      items = items.filter((saved) => saved.objectID !== item.objectID)
      persist()
    },
    getAll() {
      return [...items]
    }
  }
}
