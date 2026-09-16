import { h, isVNode, type VNode, type VNodeChild } from 'vue'

import type {
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

interface SearchResultContentProps extends StoredSearchActions {
  item: DocSearchHit
  nextItem?: DocSearchHit
  isFavorite: boolean
  isRecent: boolean
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

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(?:amp|lt|gt|quot|#39|#x27);/gi,
    (entity) => ({
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x27;': "'"
    })[entity.toLowerCase()] ?? entity
  )
}

function safeHighlight(value: unknown, fallback: string): VNodeChild {
  if (typeof value !== 'string') return fallback

  const output: VNodeChild[] = []
  let highlighted = false
  for (const segment of value.split(/(<mark>|<\/mark>)/)) {
    if (segment === '<mark>') highlighted = true
    else if (segment === '</mark>') highlighted = false
    else {
      const text = decodeHtmlEntities(segment.replace(/<[^>]*>/g, ''))
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

export function SearchResultContent(props: SearchResultContentProps) {
  const { item } = props
  const content = (
    <div class="DocSearch-Hit-Container">
      {item.__docsearch_parent ? (
        <HitTree
          continues={item.__docsearch_parent === props.nextItem?.__docsearch_parent}
        />
      ) : null}
      <div class="DocSearch-Hit-icon"><SourceIcon type={item.type} /></div>
      <div class="DocSearch-Hit-content-wrapper">
        <span class="DocSearch-Hit-title">{hitTitle(item)}</span>
        <span class="DocSearch-Hit-path">{breadcrumbs(item)}</span>
      </div>
      <ResultBadge
        item={item}
        badgeKey={props.resultBadgeKey}
        translations={props.resultsTranslations}
      />
      <StoredSearchAction {...props} />
    </div>
  )

  return renderHit(item, content, props.hitComponent)
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
  const badge = (Array.isArray(value) ? value : [value])
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
): VNode {
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

function HitTree({ continues }: { continues: boolean }) {
  return (
    <svg class="DocSearch-Hit-Tree" viewBox="0 0 24 54" aria-hidden="true">
      <path
        d={continues ? 'M8 6v42M20 27H8.3' : 'M8 6v21M20 27H8.3'}
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

function StoredSearchAction(props: SearchResultContentProps) {
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
