import type {
  AutocompleteApi,
  AutocompleteOptions,
  BaseItem
} from '@algolia/autocomplete-core'
import type { LiteClient, SearchParamsObject } from 'algoliasearch/lite'

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

export interface DocSearchIndex {
  name: string
  searchParameters?: SearchParamsObject
}

interface CommonDocSearchOptions {
  appId: string
  apiKey: string
  container: HTMLElement | string
  environment?: Window
  placeholder?: string
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
