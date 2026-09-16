import type { AutocompleteState } from '@algolia/autocomplete-core'
import { h, isVNode, type VNode, type VNodeChild } from 'vue'

import type {
  DocSearchAutocomplete,
  DocSearchHit,
  HierarchyLevel,
  HitComponent,
  ResultsTranslations,
  StartScreenTranslations
} from '../types'
import { CloseIcon, PinIcon, SelectIcon, SourceIcon } from './Icons'

export interface StoredSearchActions {
  onFavorite(item: DocSearchHit): void
  onRemoveFavorite(item: DocSearchHit): void
  onRemoveRecent(item: DocSearchHit): void
}

interface SearchResultsProps extends StoredSearchActions {
  autocomplete: DocSearchAutocomplete
  state: AutocompleteState<DocSearchHit>
  hitComponent?: HitComponent
  resultBadgeKey?: string
  resultsTranslations?: ResultsTranslations
  translations?: StartScreenTranslations
}

function getNestedValue(hit: DocSearchHit, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) return undefined
    return (value as Record<string, unknown>)[key]
  }, hit)
}

function safeHighlight(value: unknown, fallback: string): VNodeChild {
  if (typeof value !== 'string') return fallback

  const output: VNodeChild[] = []
  let highlighted = false
  for (const segment of value.split(/(<mark>|<\/mark>)/)) {
    if (segment === '<mark>') highlighted = true
    else if (segment === '</mark>') highlighted = false
    else {
      const text = segment.replace(/<[^>]*>/g, '')
      if (text) output.push(highlighted ? h('mark', text) : text)
    }
  }
  return output
}

function hitTitle(hit: DocSearchHit): VNodeChild {
  const attribute = hit.type === 'content' ? 'content' : `hierarchy.${hit.type}`
  const fallback = hit.type === 'content'
    ? hit.content ?? ''
    : hit.hierarchy[hit.type as HierarchyLevel] ?? ''

  return safeHighlight(
    getNestedValue(hit, `_snippetResult.${attribute}.value`) ??
      getNestedValue(hit, `_highlightResult.${attribute}.value`),
    fallback
  )
}

function breadcrumbs(hit: DocSearchHit): string {
  const levels: HierarchyLevel[] = [
    'lvl0', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6'
  ]
  const currentIndex = hit.type === 'content' ? levels.length : levels.indexOf(hit.type)

  return levels
    .slice(0, currentIndex)
    .map((level) => hit.hierarchy[level])
    .filter((value): value is string => Boolean(value))
    .join(' > ')
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
            <div class="DocSearch-Hit-source"><SourceIcon />{title}</div>
            <ul
              class="DocSearch-Hits-padded"
              {...props.autocomplete.getListProps({ source: collection.source })}
            >
              {collection.items.map((item) => {
                const content = (
                  <div class="DocSearch-Hit-Container">
                    {item.__docsearch_parent ? <HitTree /> : null}
                    <div class="DocSearch-Hit-icon"><SourceIcon /></div>
                    <div class="DocSearch-Hit-content-wrapper">
                      <span class="DocSearch-Hit-title">{hitTitle(item)}</span>
                      <span class="DocSearch-Hit-path">{breadcrumbs(item)}</span>
                    </div>
                    <ResultBadge
                      item={item}
                      badgeKey={props.resultBadgeKey}
                      translations={props.resultsTranslations}
                    />
                    <StoredSearchAction
                      item={item}
                      isFavorite={isFavorite}
                      isRecent={isRecent}
                      translations={props.translations}
                      {...props}
                    />
                  </div>
                )

                return (
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
                    {renderHit(item, content, props.hitComponent)}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function ResultBadge({
  item,
  badgeKey,
  translations = {}
}: {
  item: DocSearchHit
  badgeKey?: string
  translations?: ResultsTranslations
}) {
  if (!badgeKey) return null

  const value = getNestedValue(item, badgeKey)
  const primitives = Array.isArray(value) ? value : [value]
  const badge = primitives
    .filter((part) => ['string', 'number', 'boolean'].includes(typeof part))
    .map(String)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')
  if (!badge) return null

  const label = translations.resultBadgeLabelText ?? 'Category'
  return (
    <div class="DocSearch-Hit-badge">
      <span class="DocSearch-VisuallyHiddenForAccessibility">{label}: {badge}</span>
      <span aria-hidden="true">{badge}</span>
    </div>
  )
}

function renderHit(
  hit: DocSearchHit,
  children: VNode,
  hitComponent?: HitComponent
): VNodeChild {
  if (!hitComponent) return h('a', { href: hit.url }, children)

  const rendered = hitComponent({ hit, children })
  if (isVNode(rendered)) return rendered

  if (
    typeof rendered === 'object' &&
    rendered !== null &&
    'type' in rendered &&
    rendered.type === 'a'
  ) {
    const { children: _legacyChildren, ...props } = rendered.props ?? {}
    return h('a', props, children)
  }

  return h('a', { href: hit.url }, children)
}

function HitTree() {
  return (
    <svg class="DocSearch-Hit-Tree" viewBox="0 0 24 54" aria-hidden="true">
      <path
        d="M8 6v21M20 27H8.3"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

function StoredSearchAction(
  props: StoredSearchActions & {
    item: DocSearchHit
    isFavorite: boolean
    isRecent: boolean
    translations?: StartScreenTranslations
  }
) {
  const pinLabel = props.translations?.saveRecentSearchButtonTitle ?? 'Pin this search'
  const removeLabel = props.isFavorite
    ? props.translations?.removeFavoriteSearchButtonTitle ?? 'Remove this saved search'
    : props.translations?.removeRecentSearchButtonTitle ?? 'Remove this search from history'

  if (!props.isRecent && !props.isFavorite) {
    return <div class="DocSearch-Hit-action"><SelectIcon /></div>
  }

  return (
    <div class="DocSearch-Hit-action">
      {props.isRecent ? (
        <button
          class="DocSearch-Hit-action-button DocSearch-Hit-action-button--pin"
          type="button"
          title={pinLabel}
          aria-label={pinLabel}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            props.onFavorite(props.item)
          }}
        >
          <PinIcon />
        </button>
      ) : null}
      <button
        class="DocSearch-Hit-action-button"
        type="button"
        title={removeLabel}
        aria-label={removeLabel}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          props.isFavorite
            ? props.onRemoveFavorite(props.item)
            : props.onRemoveRecent(props.item)
        }}
      >
        <CloseIcon />
      </button>
    </div>
  )
}
