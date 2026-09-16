import {
  createAutocomplete,
  type AutocompleteState
} from '@algolia/autocomplete-core'
import type { SearchResponse } from 'algoliasearch/lite'
import { liteClient } from 'algoliasearch/lite'
import { defineComponent, onMounted, ref, shallowRef, type PropType } from 'vue'

import { Footer } from './components/Footer'
import { ScreenState } from './components/ScreenState'
import { SearchBox } from './components/SearchBox'
import { createStoredSearches } from './storedSearches'
import type {
  DocSearchHit,
  DocSearchTransformClient,
  NormalizedDocSearchOptions
} from './types'
import { useModalEnvironment } from './useModalEnvironment'

const initialState: AutocompleteState<DocSearchHit> = {
  activeItemId: null,
  collections: [],
  completion: null,
  context: {},
  isOpen: true,
  query: '',
  status: 'idle'
}

function createSearchClient(
  options: NormalizedDocSearchOptions
): DocSearchTransformClient {
  const client = liteClient(options.appId, options.apiKey)
  client.addAlgoliaAgent('docsearch-vue', '0.0.0')

  return options.transformSearchClient?.(client) ?? client
}

export const SearchModal = defineComponent({
  name: 'DocSearchSearchModal',
  props: {
    options: {
      type: Object as PropType<NormalizedDocSearchOptions>,
      required: true
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup(props) {
    const state = shallowRef(initialState)
    const container = ref<HTMLDivElement | null>(null)
    const dropdown = ref<HTMLDivElement | null>(null)
    const form = ref<HTMLFormElement | null>(null)
    const input = ref<HTMLInputElement | null>(null)
    const modal = ref<HTMLDivElement | null>(null)
    const searchClient = createSearchClient(props.options)
    const defaultIndexName = props.options.indices[0].name
    const environment = props.options.environment ?? window
    const favoriteSearches = createStoredSearches(
      `__DOCSEARCH_FAVORITE_SEARCHES__${defaultIndexName}`,
      10,
      environment.localStorage
    )
    const recentSearches = createStoredSearches(
      `__DOCSEARCH_RECENT_SEARCHES__${defaultIndexName}`,
      favoriteSearches.getAll().length === 0
        ? props.options.recentSearchesLimit ?? 7
        : props.options.recentSearchesWithFavoritesLimit ?? 4,
      environment.localStorage
    )

    function saveRecentSearch(item: DocSearchHit): void {
      if (props.options.disableUserPersonalization) return

      const search = item.type === 'content'
        ? item.__docsearch_parent ?? { ...item, type: 'lvl1', content: null }
        : item
      const isFavorite = favoriteSearches
        .getAll()
        .some((favorite) => favorite.objectID === search.objectID)

      if (!isFavorite) recentSearches.add(search)
    }

    const autocomplete = createAutocomplete<
      DocSearchHit,
      Event,
      MouseEvent,
      KeyboardEvent
    >({
      id: 'docsearch',
      defaultActiveItemId: 0,
      openOnFocus: true,
      navigator: props.options.navigator,
      initialState: { query: '', context: {} },
      onStateChange({ state: nextState }) {
        state.value = nextState
      },
      async getSources({ query, setStatus }) {
        if (!query) {
          if (props.options.disableUserPersonalization) return []

          return [
            {
              sourceId: 'favoriteSearches',
              getItemUrl: ({ item }) => item.url,
              getItems: () => favoriteSearches.getAll(),
              onSelect: () => props.onClose()
            },
            {
              sourceId: 'recentSearches',
              getItemUrl: ({ item }) => item.url,
              getItems: () => recentSearches.getAll(),
              onSelect: () => props.onClose()
            }
          ]
        }

        try {
          const { results } = await searchClient.search<DocSearchHit>({
            requests: props.options.indices.map((index) => ({
              query,
              indexName: index.name,
              attributesToRetrieve: [
                'hierarchy.lvl0',
                'hierarchy.lvl1',
                'hierarchy.lvl2',
                'hierarchy.lvl3',
                'hierarchy.lvl4',
                'hierarchy.lvl5',
                'hierarchy.lvl6',
                'content',
                'type',
                'url'
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
            const hits = props.options.transformItems?.(response.hits) ?? response.hits
            const groupedHits = new Map<string, DocSearchHit[]>()

            for (const hit of hits) {
              const title = hit.hierarchy.lvl0 ?? ''
              groupedHits.set(title, [...(groupedHits.get(title) ?? []), hit])
            }

            return Array.from(groupedHits, ([title, items], groupIndex) => {
              const itemsWithParents = items.map((item) => {
                const parent = item.type === 'lvl1'
                  ? null
                  : items.find(
                      (candidate) =>
                        candidate.type === 'lvl1' &&
                        candidate.hierarchy.lvl1 === item.hierarchy.lvl1
                    ) ?? null

                return { ...item, __docsearch_parent: parent }
              })

              return {
                sourceId: `hits_${response.index ?? resultIndex}_${groupIndex}`,
                getItemUrl({ item }) {
                  return item.url
                },
                onSelect({ item }) {
                  saveRecentSearch(item)
                  props.onClose()
                },
                getItems() {
                  return itemsWithParents
                },
                title
              }
            })
          })
        } catch (error) {
          if ((error as Error).name === 'RetryError') setStatus('error')
          throw error
        }
      }
    })

    useModalEnvironment(
      autocomplete,
      { container, dropdown, form, input, modal },
      environment
    )
    onMounted(() => input.value?.focus())

    return () => (
      <div
        {...autocomplete.getRootProps({ 'aria-expanded': true })}
        ref={container}
        class={[
          'DocSearch',
          'DocSearch-Container',
          state.value.status === 'stalled' && 'DocSearch-Container--Stalled',
          state.value.status === 'error' && 'DocSearch-Container--Errored'
        ].filter(Boolean).join(' ')}
        role="button"
        tabindex={0}
        onMousedown={(event) => {
          if (event.target === event.currentTarget) props.onClose()
        }}
      >
        <div ref={modal} class="DocSearch-Modal" role="dialog" aria-modal="true">
          <header class="DocSearch-SearchBar">
            <SearchBox
              autocomplete={autocomplete}
              form={form}
              input={input}
              onClose={props.onClose}
              placeholder={
                props.options.translations?.modal?.searchBox?.placeholderText ??
                props.options.placeholder ??
                'Search docs'
              }
              state={state.value}
              translations={props.options.translations?.modal?.searchBox}
            />
          </header>

          <div ref={dropdown} class="DocSearch-Dropdown">
            <ScreenState
              autocomplete={autocomplete}
              state={state.value}
              translations={props.options.translations?.modal}
              onFavorite={(item) => {
                favoriteSearches.add(item)
                recentSearches.remove(item)
                void autocomplete.refresh()
              }}
              onRemoveFavorite={(item) => {
                favoriteSearches.remove(item)
                void autocomplete.refresh()
              }}
              onRemoveRecent={(item) => {
                recentSearches.remove(item)
                void autocomplete.refresh()
              }}
            />
          </div>

          <footer class="DocSearch-Footer">
            <Footer translations={props.options.translations?.modal?.footer} />
          </footer>
        </div>
      </div>
    )
  }
})
