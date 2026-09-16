import type { AutocompleteState } from '@algolia/autocomplete-core'

import type {
  DocSearchAutocomplete,
  DocSearchHit,
  ErrorTranslations,
  HitComponent,
  ModalTranslations,
  NoResultsTranslations,
  ResultsFooterComponent
} from '../types'
import { ErrorIcon, NoResultsIcon, SearchIcon } from './Icons'
import { SearchResults, type StoredSearchActions } from './SearchResults'

interface ScreenStateProps extends StoredSearchActions {
  autocomplete: DocSearchAutocomplete
  state: AutocompleteState<DocSearchHit>
  translations?: ModalTranslations
  getMissingResultsUrl?: (params: { query: string }) => string
  hitComponent?: HitComponent
  resultBadgeKey?: string
  onSelectSuggestion(query: string): void
  resultsFooterComponent?: ResultsFooterComponent
}

function NoResults({
  query,
  translations = {},
  getMissingResultsUrl,
  suggestions,
  onSelectSuggestion
}: {
  query: string
  translations?: NoResultsTranslations
  getMissingResultsUrl?: (params: { query: string }) => string
  suggestions: string[]
  onSelectSuggestion(query: string): void
}) {
  const noResultsText = translations.noResultsText ?? 'No results found for'
  const reportText =
    translations.reportMissingResultsText ??
    'Believe this query should return results?'
  const reportLinkText =
    translations.reportMissingResultsLinkText ?? 'Let us know.'

  return (
    <div class="DocSearch-NoResults">
      <div class="DocSearch-Screen-Icon"><NoResultsIcon /></div>
      <p class="DocSearch-Title">
        {noResultsText} "<strong>{query}</strong>"
      </p>
      {suggestions.length ? (
        <div class="DocSearch-NoResults-Prefill-List">
          <p class="DocSearch-Help">
            {translations.suggestedQueryText ?? 'Try searching for'}:
          </p>
          <div class="DocSearch-NoResults-Prefill-List-Items">
            {suggestions.slice(0, 3).map((suggestion) => (
              <p key={suggestion}>
                <SearchIcon size={16} />
                <button
                  class="DocSearch-Prefill"
                  type="button"
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              </p>
            ))}
          </div>
        </div>
      ) : null}
      {getMissingResultsUrl ? (
        <p class="DocSearch-Help">
          {reportText}{' '}
          <a
            href={getMissingResultsUrl({ query })}
            target="_blank"
            rel="noopener noreferrer"
          >
            {reportLinkText}
          </a>
        </p>
      ) : null}
    </div>
  )
}

function ErrorScreen({ translations = {} }: { translations?: ErrorTranslations }) {
  const titleText = translations.titleText ?? 'Unable to fetch results'
  const helpText =
    translations.helpText ?? 'You might want to check your network connection.'

  return (
    <div class="DocSearch-ErrorScreen">
      <div class="DocSearch-Screen-Icon"><ErrorIcon /></div>
      <p class="DocSearch-Title">{titleText}</p>
      <p class="DocSearch-Help">{helpText}</p>
    </div>
  )
}

export function ScreenState(props: ScreenStateProps) {
  if (props.state.status === 'error') {
    return <ErrorScreen translations={props.translations?.errorScreen} />
  }

  const hasResults = props.state.collections.some(
    (collection) => collection.items.length > 0
  )
  if (!props.state.query && !hasResults) {
    return <div class="DocSearch-Dropdown-Container" />
  }
  if (
    !hasResults &&
    (props.state.status === 'loading' || props.state.status === 'stalled')
  ) {
    return <div class="DocSearch-Dropdown-Container" aria-busy="true" />
  }
  if (!hasResults) {
    return (
      <NoResults
        query={props.state.query}
        translations={props.translations?.noResultsScreen}
        getMissingResultsUrl={props.getMissingResultsUrl}
        suggestions={
          (props.state.context.searchSuggestions as string[] | undefined) ?? []
        }
        onSelectSuggestion={props.onSelectSuggestion}
      />
    )
  }

  return (
    <SearchResults
      {...props}
      translations={props.translations?.startScreen}
      resultsTranslations={props.translations?.resultsScreen}
    />
  )
}
