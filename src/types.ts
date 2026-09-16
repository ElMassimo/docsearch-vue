import type { SearchParamsObject } from 'algoliasearch/lite'

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
