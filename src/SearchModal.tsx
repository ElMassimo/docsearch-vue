import {
  createAutocomplete,
  type AutocompleteState
} from '@algolia/autocomplete-core'
import type { SearchResponse } from 'algoliasearch/lite'
import { liteClient } from 'algoliasearch/lite'
import { defineComponent, onMounted, ref, shallowRef, type PropType } from 'vue'

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

function resultTitle(hit: DocSearchHit): string {
  return hit.hierarchy[hit.type as `lvl${0 | 1 | 2 | 3 | 4 | 5 | 6}`] ??
    hit.content ??
    ''
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

            return Array.from(groupedHits, ([title, items], groupIndex) => ({
              sourceId: `hits_${response.index ?? resultIndex}_${groupIndex}`,
              getItemUrl({ item }) {
                return item.url
              },
              onSelect() {
                props.onClose()
              },
              getItems() {
                return items
              },
              title
            }))
          })
        } catch (error) {
          if ((error as Error).name === 'RetryError') setStatus('error')
          throw error
        }
      }
    })

    onMounted(() => input.value?.focus())

    return () => {
      const { onChange, ...inputProps } = autocomplete.getInputProps({
        inputElement: input.value,
        placeholder: props.options.placeholder ?? 'Search docs'
      })

      return (
      <div
        class="DocSearch DocSearch-Container"
        {...autocomplete.getRootProps({ 'aria-expanded': true })}
      >
        <div class="DocSearch-Modal" role="dialog" aria-modal="true">
          <header class="DocSearch-SearchBar">
            <form
              class="DocSearch-Form"
              {...autocomplete.getFormProps({ inputElement: input.value })}
            >
              <label
                class="DocSearch-MagnifierLabel"
                {...autocomplete.getLabelProps()}
              >
                <span aria-hidden="true">⌕</span>
              </label>
              <input
                class="DocSearch-Input"
                ref={input}
                {...inputProps}
                onInput={onChange}
              />
            </form>
            <button class="DocSearch-Cancel" type="button" onClick={props.onClose}>
              Cancel
            </button>
          </header>

          <div class="DocSearch-Dropdown">
            {state.value.collections.map((collection) => {
              if (collection.items.length === 0) return null
              const title = collection.items[0]?.hierarchy.lvl0 ?? ''

              return (
                <section class="DocSearch-Hits" key={collection.source.sourceId}>
                  <div class="DocSearch-Hit-source">{title}</div>
                  <ul {...autocomplete.getListProps()}>
                    {collection.items.map((item) => (
                      <li
                        class="DocSearch-Hit"
                        key={item.objectID}
                        {...autocomplete.getItemProps({
                          item,
                          source: collection.source
                        })}
                      >
                        <a href={item.url}>
                          <div class="DocSearch-Hit-Container">
                            <div class="DocSearch-Hit-content-wrapper">
                              <span class="DocSearch-Hit-title">
                                {resultTitle(item)}
                              </span>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      </div>
      )
    }
  }
})
