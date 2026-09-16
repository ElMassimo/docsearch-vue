import type { AutocompleteState } from '@algolia/autocomplete-core'

import type {
  DocSearchAutocomplete,
  DocSearchHit,
  HitComponent,
  ResultsFooterComponent,
  ResultsTranslations,
  StartScreenTranslations
} from '../types'
import { PinIcon, RecentIcon } from './Icons'
import {
  SearchResultContent,
  type StoredSearchActions
} from './SearchResultContent'

export type { StoredSearchActions } from './SearchResultContent'

interface SearchResultsProps extends StoredSearchActions {
  autocomplete: DocSearchAutocomplete
  state: AutocompleteState<DocSearchHit>
  hitComponent?: HitComponent
  resultBadgeKey?: string
  resultsTranslations?: ResultsTranslations
  resultsFooterComponent?: ResultsFooterComponent
  translations?: StartScreenTranslations
}

function sourceTitle(
  sourceId: string,
  fallback: string,
  translations: StartScreenTranslations = {}
): string {
  if (sourceId === 'favoriteSearches') {
    return translations.favoriteSearchesTitle ?? 'Pinned'
  }
  if (sourceId === 'recentSearches') {
    return translations.recentSearchesTitle ?? 'Recently viewed docs'
  }
  return fallback
}

export function SearchResults(props: SearchResultsProps) {
  return (
    <div class="DocSearch-Dropdown-Container">
      {props.state.collections.map((collection) => {
        if (collection.items.length === 0) return null
        const sourceId = collection.source.sourceId
        const isFavorite = sourceId === 'favoriteSearches'
        const isRecent = sourceId === 'recentSearches'
        const title = sourceTitle(
          sourceId,
          collection.items[0]?.hierarchy.lvl0 ?? '',
          props.translations
        )

        return (
          <section class="DocSearch-Hits" key={sourceId}>
            <div class="DocSearch-Hit-source">
              {isFavorite ? <PinIcon /> : isRecent ? <RecentIcon /> : null}
              {title}
            </div>
            <ul
              class="DocSearch-Hits-padded"
              {...props.autocomplete.getListProps({ source: collection.source })}
            >
              {collection.items.map((item, index) => (
                <li
                  class={[
                    'DocSearch-Hit',
                    item.__docsearch_parent && 'DocSearch-Hit--Child'
                  ].filter(Boolean).join(' ')}
                  key={item.objectID}
                  {...props.autocomplete.getItemProps({
                    item,
                    source: collection.source
                  })}
                >
                  <SearchResultContent
                    {...props}
                    item={item}
                    nextItem={collection.items[index + 1]}
                    isFavorite={isFavorite}
                    isRecent={isRecent}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      {props.resultsFooterComponent ? (
        <section class="DocSearch-HitsFooter">
          {props.resultsFooterComponent({ state: props.state })}
        </section>
      ) : null}
    </div>
  )
}
