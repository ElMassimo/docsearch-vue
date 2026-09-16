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
            async search(params) {
              const requests = (params as {
                requests: Array<{ query?: string }>
              }).requests
              const query = requests[0]?.query ?? ''
              const isInstall = query === 'install'
              return {
                results: [
                  {
                    index: 'test-docs',
                    hits: [
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
                    hitsPerPage: 20,
                    nbHits: 1,
                    nbPages: 1,
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
