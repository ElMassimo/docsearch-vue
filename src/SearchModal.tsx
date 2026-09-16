import { defineComponent, onMounted, ref, type PropType } from 'vue'

import { FacetBar } from './components/FacetBar'
import { Footer } from './components/Footer'
import { ScreenState } from './components/ScreenState'
import { SearchBox } from './components/SearchBox'
import type { NormalizedDocSearchOptions } from './types'
import { useDocSearchAutocomplete } from './useDocSearchAutocomplete'
import { useModalEnvironment } from './useModalEnvironment'

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
    const container = ref<HTMLDivElement | null>(null)
    const dropdown = ref<HTMLDivElement | null>(null)
    const form = ref<HTMLFormElement | null>(null)
    const input = ref<HTMLInputElement | null>(null)
    const modal = ref<HTMLDivElement | null>(null)
    const {
      autocomplete,
      clearFacetSelections,
      environment,
      facetSelections,
      favorite,
      removeFavorite,
      removeRecent,
      setFacetSelection,
      state,
      visibleFacets
    } = useDocSearchAutocomplete(props.options, props.onClose)

    useModalEnvironment(
      autocomplete,
      { container, dropdown, form, input, modal },
      environment,
      props.options.theme
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

          {state.value.query ? (
            <FacetBar
              facets={visibleFacets.value}
              selections={facetSelections.value}
              translations={props.options.translations?.modal?.facets}
              onSelectionChange={setFacetSelection}
              onClear={clearFacetSelections}
            />
          ) : null}

          <div ref={dropdown} class="DocSearch-Dropdown">
            <ScreenState
              autocomplete={autocomplete}
              state={state.value}
              translations={props.options.translations?.modal}
              getMissingResultsUrl={props.options.getMissingResultsUrl}
              hitComponent={props.options.hitComponent}
              onFavorite={favorite}
              onRemoveFavorite={removeFavorite}
              onRemoveRecent={removeRecent}
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
