import type { AutocompleteState } from '@algolia/autocomplete-core'
import type { Ref } from 'vue'

import type { DocSearchAutocomplete, DocSearchHit } from '../types'
import { CloseIcon, SearchIcon } from './Icons'

interface SearchBoxProps {
  autocomplete: DocSearchAutocomplete
  input: Ref<HTMLInputElement | null>
  onClose: () => void
  placeholder: string
  state: AutocompleteState<DocSearchHit>
}

export function SearchBox(props: SearchBoxProps) {
  const formProps = props.autocomplete.getFormProps({
    inputElement: props.input.value
  })
  const {
    onChange,
    onCompositionEnd,
    onKeyDown,
    ...inputProps
  } = props.autocomplete.getInputProps({
    inputElement: props.input.value,
    maxLength: 64,
    placeholder: props.placeholder
  })
  const isLoading = props.state.status === 'stalled'
  const hasQuery = Boolean(props.state.query)

  return (
    <form class="DocSearch-Form" {...formProps}>
      <label
        class={isLoading ? 'DocSearch-LoadingIndicator' : 'DocSearch-MagnifierLabel'}
        {...props.autocomplete.getLabelProps()}
      >
        <SearchIcon />
        <span class="DocSearch-VisuallyHiddenForAccessibility">Search</span>
      </label>

      <input
        class="DocSearch-Input"
        ref={props.input}
        {...inputProps}
        onInput={onChange}
        onCompositionend={onCompositionEnd}
        onKeydown={onKeyDown}
      />

      <div class="DocSearch-Actions">
        <button
          class="DocSearch-Clear"
          type="reset"
          aria-label="Clear the query"
          hidden={!hasQuery}
          tabindex={hasQuery ? 0 : -1}
        >
          Clear
        </button>
        {hasQuery ? <div class="DocSearch-Divider" /> : null}
        <button
          class="DocSearch-Action DocSearch-Close"
          type="button"
          title="Close"
          aria-label="Close"
          onClick={props.onClose}
        >
          <CloseIcon />
        </button>
      </div>
    </form>
  )
}
