import type {
  DocSearchOptions,
  NormalizedDocSearchOptions
} from './types'

export function normalizeOptions(
  options: DocSearchOptions
): NormalizedDocSearchOptions {
  if (options.indices && 'indexName' in options && options.indexName) {
    throw new Error('Pass either `indices` or `indexName`, not both.')
  }

  const indices = options.indices
    ? options.indices.map((index) =>
        typeof index === 'string' ? { name: index } : index
      )
    : 'indexName' in options && options.indexName
      ? [
          {
            name: options.indexName,
            searchParameters: options.searchParameters
          }
        ]
      : []

  if (indices.length === 0) {
    throw new Error('Must supply at least one `indices` entry for DocSearch.')
  }

  return {
    appId: options.appId,
    apiKey: options.apiKey,
    container: options.container,
    environment: options.environment,
    placeholder: options.placeholder,
    initialQuery: options.initialQuery,
    onReady: options.onReady,
    onOpen: options.onOpen,
    onClose: options.onClose,
    getMissingResultsUrl: options.getMissingResultsUrl,
    translations: options.translations,
    disableUserPersonalization: options.disableUserPersonalization,
    maxResultsPerGroup: options.maxResultsPerGroup,
    recentSearchesLimit: options.recentSearchesLimit,
    recentSearchesWithFavoritesLimit:
      options.recentSearchesWithFavoritesLimit,
    navigator: options.navigator,
    transformItems: options.transformItems,
    transformSearchClient: options.transformSearchClient,
    indices
  }
}
