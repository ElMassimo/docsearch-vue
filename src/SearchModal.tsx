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
import type {
  DocSearchHit,
  DocSearchTransformClient,
  NormalizedDocSearchOptions
} from './types'

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
    const input = ref<HTMLInputElement | null>(null)
    const searchClient = createSearchClient(props.options)

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
        if (!query) return []

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
                onSelect() {
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

    onMounted(() => input.value?.focus())

    return () => (
      <div
        {...autocomplete.getRootProps({ 'aria-expanded': true })}
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
        <div class="DocSearch-Modal" role="dialog" aria-modal="true">
          <header class="DocSearch-SearchBar">
            <SearchBox
              autocomplete={autocomplete}
              input={input}
              onClose={props.onClose}
              placeholder={props.options.placeholder ?? 'Search docs'}
              state={state.value}
            />
          </header>

          <div class="DocSearch-Dropdown">
            <ScreenState autocomplete={autocomplete} state={state.value} />
          </div>

          <footer class="DocSearch-Footer"><Footer /></footer>
        </div>
      </div>
    )
  }
})
