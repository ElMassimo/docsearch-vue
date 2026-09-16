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
        transformSearchClient(searchClient) {
          return {
            ...searchClient,
            async search() {
              return {
                results: [
                  {
                    index: 'test-docs',
                    hits: [
                      {
                        objectID: 'getting-started',
                        type: 'lvl1',
                        url: '/guide/getting-started',
                        hierarchy: {
                          lvl0: 'Guide',
                          lvl1: 'Getting Started'
                        }
                      }
                    ],
                    hitsPerPage: 20,
                    nbHits: 1,
                    nbPages: 1,
                    page: 0,
                    processingTimeMS: 1,
                    exhaustiveNbHits: true,
                    query: 'getting',
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
