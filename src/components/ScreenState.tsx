import type { AutocompleteState } from '@algolia/autocomplete-core'
import { h, type VNodeChild } from 'vue'

import type { DocSearchAutocomplete, DocSearchHit, HierarchyLevel } from '../types'
import { ErrorIcon, NoResultsIcon, SelectIcon, SourceIcon } from './Icons'

interface ScreenStateProps {
  autocomplete: DocSearchAutocomplete
  state: AutocompleteState<DocSearchHit>
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
      output.push(highlighted ? h('mark', segment) : segment)
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

function NoResults({ query }: { query: string }) {
  return (
    <div class="DocSearch-NoResults">
      <div class="DocSearch-Screen-Icon"><NoResultsIcon /></div>
      <p class="DocSearch-Title">
        No results found for "<strong>{query}</strong>"
      </p>
    </div>
  )
}

function ErrorScreen() {
  return (
    <div class="DocSearch-ErrorScreen">
      <div class="DocSearch-Screen-Icon"><ErrorIcon /></div>
      <p class="DocSearch-Title">Unable to fetch results</p>
      <p class="DocSearch-Help">You might want to check your network connection.</p>
    </div>
  )
}

export function ScreenState(props: ScreenStateProps) {
  if (props.state.status === 'error') return <ErrorScreen />
  if (!props.state.query) return <div class="DocSearch-Dropdown-Container" />

  const hasResults = props.state.collections.some(
    (collection) => collection.items.length > 0
  )
  if (!hasResults) return <NoResults query={props.state.query} />

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
                  class="DocSearch-Hit"
                  key={item.objectID}
                  {...props.autocomplete.getItemProps({
                    item,
                    source: collection.source
                  })}
                >
                  <a href={item.url}>
                    <div class="DocSearch-Hit-Container">
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
