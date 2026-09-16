import {
  createAutocomplete,
  type AutocompleteState
} from '@algolia/autocomplete-core'
import type { SearchResponse } from 'algoliasearch/lite'
import { liteClient } from 'algoliasearch/lite'
import { shallowRef } from 'vue'

import { createStoredSearches } from './storedSearches'
import type {
  DocSearchAutocomplete,
  DocSearchHit,
  DocSearchTransformClient,
  NormalizedDocSearchOptions
} from './types'

function createSearchClient(
  options: NormalizedDocSearchOptions
): DocSearchTransformClient {
  const client = liteClient(options.appId, options.apiKey)
  client.addAlgoliaAgent('docsearch-vue', '0.0.0')
  return options.transformSearchClient?.(client) ?? client
}

function isModifierEvent(event: Event): boolean {
  const modifiedEvent = event as MouseEvent | KeyboardEvent
  return (
    (modifiedEvent as MouseEvent).button === 1 ||
    modifiedEvent.altKey ||
    modifiedEvent.ctrlKey ||
    modifiedEvent.metaKey ||
    modifiedEvent.shiftKey
  )
}

function addParents(items: DocSearchHit[]): DocSearchHit[] {
  return items.map((item) => ({
    ...item,
    __docsearch_parent: item.type === 'lvl1'
      ? null
      : items.find(
          (candidate) =>
            candidate.type === 'lvl1' &&
            candidate.hierarchy.lvl1 === item.hierarchy.lvl1
        ) ?? null
  }))
}

export function useDocSearchAutocomplete(
  options: NormalizedDocSearchOptions,
  onClose: () => void
) {
  const state = shallowRef<AutocompleteState<DocSearchHit>>({
    activeItemId: null,
    collections: [],
    completion: null,
    context: {},
    isOpen: true,
    query: '',
    status: 'idle'
  })
  const environment = options.environment ?? window
  const defaultIndexName = options.indices[0].name
  const favoriteSearches = createStoredSearches(
    `__DOCSEARCH_FAVORITE_SEARCHES__${defaultIndexName}`,
    10,
    environment.localStorage
  )
  const recentSearches = createStoredSearches(
    `__DOCSEARCH_RECENT_SEARCHES__${defaultIndexName}`,
    favoriteSearches.getAll().length === 0
      ? options.recentSearchesLimit ?? 7
      : options.recentSearchesWithFavoritesLimit ?? 4,
    environment.localStorage
  )
  const searchClient = createSearchClient(options)

  function saveRecentSearch(item: DocSearchHit): void {
    if (options.disableUserPersonalization) return

    const search = item.type === 'content'
      ? item.__docsearch_parent ?? { ...item, type: 'lvl1' as const, content: null }
      : item
    const isFavorite = favoriteSearches
      .getAll()
      .some((favorite) => favorite.objectID === search.objectID)

    if (!isFavorite) recentSearches.add(search)
  }

  const autocomplete: DocSearchAutocomplete = createAutocomplete<
    DocSearchHit,
    Event,
    MouseEvent,
    KeyboardEvent
  >({
    id: 'docsearch',
    defaultActiveItemId: 0,
    openOnFocus: true,
    navigator: options.navigator,
    initialState: { query: options.initialQuery ?? '', context: {} },
    onStateChange({ state: nextState }) {
      state.value = nextState
    },
    async getSources({ query, setStatus }) {
      if (!query) {
        if (options.disableUserPersonalization) return []

        return [
          {
            sourceId: 'favoriteSearches',
            getItemUrl: ({ item }) => item.url,
            getItems: () => favoriteSearches.getAll(),
            onSelect: ({ event }) => {
              if (!isModifierEvent(event)) onClose()
            }
          },
          {
            sourceId: 'recentSearches',
            getItemUrl: ({ item }) => item.url,
            getItems: () => recentSearches.getAll(),
            onSelect: ({ event }) => {
              if (!isModifierEvent(event)) onClose()
            }
          }
        ]
      }

      try {
        const { results } = await searchClient.search<DocSearchHit>({
          requests: options.indices.map((index) => ({
            query,
            indexName: index.name,
            attributesToRetrieve: [
              'hierarchy.lvl0', 'hierarchy.lvl1', 'hierarchy.lvl2',
              'hierarchy.lvl3', 'hierarchy.lvl4', 'hierarchy.lvl5',
              'hierarchy.lvl6', 'content', 'type', 'url'
            ],
            attributesToSnippet: ['content:10'],
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
            hitsPerPage: 20,
            ...index.searchParameters
          }))
        })

        return results.flatMap((result, resultIndex) => {
          const response = result as SearchResponse<DocSearchHit>
          const hits = options.transformItems?.(response.hits) ?? response.hits
          const groupedHits = new Map<string, DocSearchHit[]>()

          for (const hit of hits) {
            const title = hit.hierarchy.lvl0 ?? ''
            groupedHits.set(title, [...(groupedHits.get(title) ?? []), hit])
          }

          return Array.from(groupedHits, ([, items], groupIndex) => ({
            sourceId: `hits_${response.index ?? resultIndex}_${groupIndex}`,
            getItemUrl: ({ item }) => item.url,
            onSelect({ item, event }) {
              saveRecentSearch(item)
              if (!isModifierEvent(event)) onClose()
            },
            getItems: () => addParents(
              items.slice(0, options.maxResultsPerGroup || 5)
            )
          }))
        })
      } catch (error) {
        if ((error as Error).name === 'RetryError') setStatus('error')
        throw error
      }
    }
  })

  return {
    autocomplete,
    environment,
    favorite(item: DocSearchHit) {
      favoriteSearches.add(item)
      recentSearches.remove(item)
      void autocomplete.refresh()
    },
    removeFavorite(item: DocSearchHit) {
      favoriteSearches.remove(item)
      void autocomplete.refresh()
    },
    removeRecent(item: DocSearchHit) {
      recentSearches.remove(item)
      void autocomplete.refresh()
    },
    state
  }
}
