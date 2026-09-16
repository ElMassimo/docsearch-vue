import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DocSearch Vue fixture',
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: 'test-app',
        apiKey: 'test-key',
        indexName: 'test-docs',
        facets: [{ key: 'language', label: 'Language' }],
        transformSearchClient(searchClient) {
          return {
            ...searchClient,
            async search(params) {
              const requests = (params as {
                requests: Array<{ query?: string; hitsPerPage?: number }>
              }).requests
              const query = requests[0]?.query ?? ''
              const isFacetRequest = requests[0]?.hitsPerPage === 0
              const isInstall = query === 'install'
              return {
                results: [
                  {
                    index: 'test-docs',
                    facets: isFacetRequest
                      ? { language: { en: 2, fr: 1 } }
                      : undefined,
                    hits: isFacetRequest ? [] : [
                      {
                        objectID: isInstall ? 'install' : 'getting-started',
                        type: 'lvl1',
                        url: isInstall
                          ? '/guide/getting-started#install'
                          : '/guide/getting-started',
                        hierarchy: {
                          lvl0: 'Guide',
                          lvl1: isInstall ? 'Install' : 'Getting Started'
                        }
                      }
                    ],
                    hitsPerPage: isFacetRequest ? 0 : 20,
                    nbHits: isFacetRequest ? 0 : 1,
                    nbPages: isFacetRequest ? 0 : 1,
                    page: 0,
                    processingTimeMS: 1,
                    exhaustiveNbHits: true,
                    query,
                    params: ''
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^@docsearch\/js$/,
          replacement: fileURLToPath(
            new URL('../../../src/index.ts', import.meta.url)
          )
        },
        {
          find: /^@docsearch\/css$/,
          replacement: fileURLToPath(
            new URL('../../../src/style.css', import.meta.url)
          )
        }
      ]
    }
  }
})
