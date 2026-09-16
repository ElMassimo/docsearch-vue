import type { AutocompleteState } from '@algolia/autocomplete-core'
import type { Ref } from 'vue'

import type {
  DocSearchAutocomplete,
  DocSearchHit,
  SearchBoxTranslations
} from '../types'
import { CloseIcon, LoadingIcon, SearchIcon } from './Icons'

interface SearchBoxProps {
  autocomplete: DocSearchAutocomplete
  form: Ref<HTMLFormElement | null>
  input: Ref<HTMLInputElement | null>
  onClose: () => void
  placeholder: string
  state: AutocompleteState<DocSearchHit>
  translations?: SearchBoxTranslations
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
  const clearButtonTitle =
    props.translations?.clearButtonTitle ??
    props.translations?.resetButtonTitle ??
    'Clear'
  const clearButtonAriaLabel =
    props.translations?.clearButtonAriaLabel ??
    props.translations?.resetButtonAriaLabel ??
    'Clear the query'
  const closeButtonText =
    props.translations?.closeButtonText ??
    props.translations?.cancelButtonText ??
    'Close'
  const closeButtonAriaLabel =
    props.translations?.closeButtonAriaLabel ??
    props.translations?.cancelButtonAriaLabel ??
    'Close'
  const searchInputLabel = props.translations?.searchInputLabel ?? 'Search'

  return (
    <form class="DocSearch-Form" ref={props.form} {...formProps}>
      {isLoading ? (
        <div class="DocSearch-LoadingIndicator"><LoadingIcon /></div>
      ) : (
        <label
          class="DocSearch-MagnifierLabel"
          {...props.autocomplete.getLabelProps()}
        >
          <SearchIcon />
          <span class="DocSearch-VisuallyHiddenForAccessibility">
            {searchInputLabel}
          </span>
        </label>
      )}

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
          aria-label={clearButtonAriaLabel}
          hidden={!hasQuery}
          tabindex={hasQuery ? 0 : -1}
        >
          {clearButtonTitle}
        </button>
        {hasQuery ? <div class="DocSearch-Divider" /> : null}
        <button
          class="DocSearch-Action DocSearch-Close"
          type="button"
          title={closeButtonText}
          aria-label={closeButtonAriaLabel}
          onClick={props.onClose}
        >
          <CloseIcon />
        </button>
      </div>
    </form>
  )
}
