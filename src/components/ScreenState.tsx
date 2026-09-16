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
import { ErrorIcon, NoResultsIcon } from './Icons'
import { SearchResults, type StoredSearchActions } from './SearchResults'

interface ScreenStateProps extends StoredSearchActions {
  autocomplete: DocSearchAutocomplete
  state: AutocompleteState<DocSearchHit>
  translations?: ModalTranslations
  getMissingResultsUrl?: (params: { query: string }) => string
  hitComponent?: HitComponent
  resultBadgeKey?: string
  resultsFooterComponent?: ResultsFooterComponent
}

function NoResults({
  query,
  translations = {},
  getMissingResultsUrl
}: {
  query: string
  translations?: NoResultsTranslations
  getMissingResultsUrl?: (params: { query: string }) => string
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
  if (!hasResults) {
    return (
      <NoResults
        query={props.state.query}
        translations={props.translations?.noResultsScreen}
        getMissingResultsUrl={props.getMissingResultsUrl}
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
