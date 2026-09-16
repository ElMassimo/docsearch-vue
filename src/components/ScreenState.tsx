import type { AutocompleteState } from '@algolia/autocomplete-core'
import { h, type VNodeChild } from 'vue'

import type {
  DocSearchAutocomplete,
  DocSearchHit,
  ErrorTranslations,
  HierarchyLevel,
  ModalTranslations,
  NoResultsTranslations
} from '../types'
import { ErrorIcon, NoResultsIcon, SelectIcon, SourceIcon } from './Icons'

interface ScreenStateProps {
  autocomplete: DocSearchAutocomplete
  state: AutocompleteState<DocSearchHit>
  translations?: ModalTranslations
}

function getNestedValue(hit: DocSearchHit, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) return undefined
    return (value as Record<string, unknown>)[key]
  }, hit)
}

function safeHighlight(value: unknown, fallback: string): VNodeChild {
  if (typeof value !== 'string') return fallback

  const segments = value.split(/(<mark>|<\/mark>)/)
  const output: VNodeChild[] = []
  let highlighted = false

  for (const segment of segments) {
    if (segment === '<mark>') {
      highlighted = true
    } else if (segment === '</mark>') {
      highlighted = false
    } else if (segment) {
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

function NoResults({
  query,
  translations = {}
}: {
  query: string
  translations?: NoResultsTranslations
}) {
  const noResultsText = translations.noResultsText ?? 'No results found for'

  return (
    <div class="DocSearch-NoResults">
      <div class="DocSearch-Screen-Icon"><NoResultsIcon /></div>
      <p class="DocSearch-Title">
        {noResultsText} "<strong>{query}</strong>"
      </p>
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
  if (!props.state.query) return <div class="DocSearch-Dropdown-Container" />

  const hasResults = props.state.collections.some(
    (collection) => collection.items.length > 0
  )
  if (!hasResults) {
    return (
      <NoResults
        query={props.state.query}
        translations={props.translations?.noResultsScreen}
      />
    )
  }

  return (
    <div class="DocSearch-Dropdown-Container">
      {props.state.collections.map((collection) => {
        if (collection.items.length === 0) return null
        const title = collection.items[0]?.hierarchy.lvl0 ?? ''

        return (
          <section class="DocSearch-Hits" key={collection.source.sourceId}>
            <div class="DocSearch-Hit-source">
              <SourceIcon />
              {title}
            </div>
            <ul
              class="DocSearch-Hits-padded"
              {...props.autocomplete.getListProps({ source: collection.source })}
            >
              {collection.items.map((item) => (
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
                  <a href={item.url}>
                    <div class="DocSearch-Hit-Container">
                      {item.__docsearch_parent ? (
                        <svg class="DocSearch-Hit-Tree" viewBox="0 0 24 54" aria-hidden="true">
                          <path
                            d="M8 6v21M20 27H8.3"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      ) : null}
                      <div class="DocSearch-Hit-icon"><SourceIcon /></div>
                      <div class="DocSearch-Hit-content-wrapper">
                        <span class="DocSearch-Hit-title">{hitTitle(item)}</span>
                        <span class="DocSearch-Hit-path">{breadcrumbs(item)}</span>
                      </div>
                      <div class="DocSearch-Hit-action"><SelectIcon /></div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
