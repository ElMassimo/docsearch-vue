import type {
  AutocompleteApi,
  AutocompleteOptions,
  BaseItem
} from '@algolia/autocomplete-core'
import type { LiteClient, SearchParamsObject } from 'algoliasearch/lite'
import type { VNode, VNodeChild } from 'vue'

export type HierarchyLevel = `lvl${0 | 1 | 2 | 3 | 4 | 5 | 6}`

type HighlightValue = { value: string }

export interface DocSearchHit extends BaseItem {
  objectID: string
  type: HierarchyLevel | 'content'
  url: string
  content?: string | null
  hierarchy: Partial<Record<HierarchyLevel, string | null>>
  _highlightResult?: {
    hierarchy?: Partial<Record<HierarchyLevel, HighlightValue>>
    content?: HighlightValue
  }
  _snippetResult?: {
    hierarchy?: Partial<Record<HierarchyLevel, HighlightValue>>
    content?: HighlightValue
  }
  __docsearch_parent?: DocSearchHit | null
}

export type DocSearchAutocomplete = AutocompleteApi<
  DocSearchHit,
  Event,
  MouseEvent,
  KeyboardEvent
>

export type DocSearchTransformClient = Pick<
  LiteClient,
  'search' | 'addAlgoliaAgent' | 'transporter'
>

export interface ButtonTranslations {
  buttonText?: string
  buttonAriaLabel?: string
}

export interface SearchBoxTranslations {
  clearButtonTitle?: string
  clearButtonAriaLabel?: string
  closeButtonText?: string
  closeButtonAriaLabel?: string
  placeholderText?: string
  searchInputLabel?: string
  resetButtonTitle?: string
  resetButtonAriaLabel?: string
  cancelButtonText?: string
  cancelButtonAriaLabel?: string
}

export interface FooterTranslations {
  navigateText?: string
  selectText?: string
  closeText?: string
  poweredByText?: string
}

export interface NoResultsTranslations {
  noResultsText?: string
  reportMissingResultsText?: string
  reportMissingResultsLinkText?: string
}

export interface StartScreenTranslations {
  recentSearchesTitle?: string
  favoriteSearchesTitle?: string
  saveRecentSearchButtonTitle?: string
  removeRecentSearchButtonTitle?: string
  removeFavoriteSearchButtonTitle?: string
}

export interface ErrorTranslations {
  titleText?: string
  helpText?: string
}

export interface ModalTranslations {
  searchBox?: SearchBoxTranslations
  footer?: FooterTranslations
  noResultsScreen?: NoResultsTranslations
  errorScreen?: ErrorTranslations
  startScreen?: StartScreenTranslations
}

export interface DocSearchTranslations {
  button?: ButtonTranslations
  modal?: ModalTranslations
}

export interface DocSearchIndex {
  name: string
  searchParameters?: SearchParamsObject
}

export interface DocSearchFacet {
  key: string
  label?: string
}

export interface HitComponentProps {
  hit: DocSearchHit
  children: VNodeChild
}

export interface VitePressHitVNode {
  type: 'a'
  props?: Record<string, unknown> & { children?: unknown }
}

export type HitComponent = (
  props: HitComponentProps
) => VNode | VitePressHitVNode

interface CommonDocSearchOptions {
  appId: string
  apiKey: string
  container: HTMLElement | string
  environment?: Window
  placeholder?: string
  initialQuery?: string
  onReady?: () => void
  onOpen?: () => void
  onClose?: () => void
  getMissingResultsUrl?: (params: { query: string }) => string
  translations?: DocSearchTranslations
  disableUserPersonalization?: boolean
  maxResultsPerGroup?: number
  hitComponent?: HitComponent
  recentSearchesLimit?: number
  recentSearchesWithFavoritesLimit?: number
  navigator?: AutocompleteOptions<DocSearchHit>['navigator']
  transformItems?: (items: DocSearchHit[]) => DocSearchHit[]
  transformSearchClient?: (
    searchClient: DocSearchTransformClient
  ) => DocSearchTransformClient
}

export type NativeDocSearchOptions = CommonDocSearchOptions & {
  indices: Array<DocSearchIndex | string>
  indexName?: never
  searchParameters?: never
}

export type VitePressDocSearchOptions = CommonDocSearchOptions & {
  indexName: string
  searchParameters?: SearchParamsObject
  indices?: never
}

export type DocSearchOptions =
  | NativeDocSearchOptions
  | VitePressDocSearchOptions

export interface NormalizedDocSearchOptions extends CommonDocSearchOptions {
  indices: DocSearchIndex[]
}
