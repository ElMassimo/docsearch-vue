import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import docsearch from '../src'

const instances: Array<{ destroy(): void }> = []

afterEach(() => {
  for (const instance of instances.splice(0)) {
    instance.destroy()
  }
  document.body.innerHTML = ''
})

describe('docsearch', () => {
  it('mounts a Vue search button into a selector', () => {
    document.body.innerHTML = '<div id="docsearch"></div>'

    instances.push(
      docsearch({
        appId: 'app',
        apiKey: 'key',
        container: '#docsearch',
        indices: ['docs']
      })
    )

    expect(document.querySelector('.DocSearch-Button')).not.toBeNull()
    expect(document.querySelector('.DocSearch-Button')?.textContent).toContain(
      'Search'
    )
  })

  it('applies DocSearch 5 translations', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs'],
      translations: {
        button: {
          buttonText: 'Rechercher',
          buttonAriaLabel: 'Ouvrir la recherche'
        },
        modal: {
          searchBox: {
            clearButtonTitle: 'Effacer',
            closeButtonAriaLabel: 'Fermer',
            placeholderText: 'Rechercher la documentation'
          },
          footer: {
            navigateText: 'Naviguer',
            selectText: 'Sélectionner',
            closeText: 'Fermer'
          }
        }
      }
    })
    instances.push(instance)

    expect(document.querySelector('.DocSearch-Button')?.textContent).toContain(
      'Rechercher'
    )
    expect(document.querySelector('.DocSearch-Button')?.getAttribute('aria-label')).toBe(
      'Ouvrir la recherche'
    )

    instance.open()
    await nextTick()

    expect(document.querySelector('.DocSearch-Input')?.getAttribute('placeholder')).toBe(
      'Rechercher la documentation'
    )
    expect(document.querySelector('.DocSearch-Clear')?.textContent).toBe('Effacer')
    expect(document.querySelector('.DocSearch-Close')?.getAttribute('aria-label')).toBe(
      'Fermer'
    )
    expect(document.querySelector('.DocSearch-Footer')?.textContent).toContain(
      'Naviguer'
    )
  })

  it('opens with an initial query and calls lifecycle callbacks', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const onReady = vi.fn()
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs'],
      initialQuery: 'getting',
      onReady,
      onOpen,
      onClose,
      transformSearchClient(searchClient) {
        return {
          ...searchClient,
          async search() {
            return {
              results: [
                {
                  index: 'docs',
                  hits: [],
                  hitsPerPage: 20,
                  nbHits: 0,
                  nbPages: 0,
                  page: 0,
                  processingTimeMS: 1,
                  exhaustiveNbHits: true,
                  query: 'getting',
                  params: ''
                }
              ]
            } as never
          }
        }
      }
    })
    instances.push(instance)

    expect(onReady).toHaveBeenCalledOnce()
    instance.open()
    await nextTick()

    expect(onOpen).toHaveBeenCalledOnce()
    expect(document.querySelector<HTMLInputElement>('.DocSearch-Input')?.value).toBe(
      'getting'
    )

    instance.close()
    await nextTick()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('opens, closes, and destroys the teleported modal', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs']
    })
    instances.push(instance)

    expect(instance.isReady).toBe(true)
    expect(instance.isOpen).toBe(false)

    instance.open()
    await nextTick()

    expect(instance.isOpen).toBe(true)
    expect(document.querySelector('.DocSearch-Modal')).not.toBeNull()

    instance.close()
    await nextTick()

    expect(instance.isOpen).toBe(false)
    expect(document.querySelector('.DocSearch-Modal')).toBeNull()

    instance.destroy()

    expect(instance.isReady).toBe(false)
    expect(document.querySelector('.DocSearch-Button')).toBeNull()
  })

  it('opens from VitePress keyboard polling and closes with Escape', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs']
    })
    instances.push(instance)

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true })
    )
    await nextTick()

    expect(instance.isOpen).toBe(true)
    expect(document.querySelector('.DocSearch-Modal')).not.toBeNull()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(instance.isOpen).toBe(false)
    expect(document.querySelector('.DocSearch-Modal')).toBeNull()
  })

  it('closes from the modal close button and backdrop', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs']
    })
    instances.push(instance)

    instance.open()
    await nextTick()
    document.querySelector<HTMLButtonElement>('.DocSearch-Close')!.click()
    await nextTick()
    expect(instance.isOpen).toBe(false)

    instance.open()
    await nextTick()
    document
      .querySelector<HTMLElement>('.DocSearch-Container')!
      .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(instance.isOpen).toBe(false)
  })

  it('renders grouped DocSearch 5 results through autocomplete-core', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs'],
      maxResultsPerGroup: 2,
      hitComponent({ hit, children }) {
        return {
          __v: null,
          type: 'a',
          ref: undefined,
          constructor: undefined,
          key: undefined,
          props: {
            href: hit.url,
            children,
            'data-vitepress-hit': 'true'
          }
        }
      },
      navigator: {
        navigate: vi.fn(),
        navigateNewTab: vi.fn(),
        navigateNewWindow: vi.fn()
      },
      transformSearchClient(searchClient) {
        return {
          ...searchClient,
          async search() {
            return {
              results: [
                {
                  index: 'docs',
                  hits: [
                    {
                      objectID: 'getting-started',
                      type: 'lvl1',
                      url: '/guide/getting-started',
                      hierarchy: {
                        lvl0: 'Guide',
                        lvl1: 'Getting Started'
                      },
                      _highlightResult: {
                        hierarchy: {
                          lvl1: {
                            value: 'Getting <mark>Started</mark><img src=x>'
                          }
                        }
                      }
                    },
                    {
                      objectID: 'install',
                      type: 'content',
                      content: 'Install the package',
                      url: '/guide/getting-started#install',
                      hierarchy: {
                        lvl0: 'Guide',
                        lvl1: 'Getting Started'
                      }
                    },
                    {
                      objectID: 'configure',
                      type: 'content',
                      content: 'Configure the package',
                      url: '/guide/getting-started#configure',
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
            } as never
          }
        }
      }
    })
    instances.push(instance)

    instance.open()
    await nextTick()

    const input = document.querySelector<HTMLInputElement>('.DocSearch-Input')
    expect(input).not.toBeNull()

    input!.value = 'getting'
    input!.dispatchEvent(new Event('input', { bubbles: true }))

    await expect
      .poll(
        () => document.querySelector('.DocSearch-Hit-title')?.textContent
      )
      .toBe('Getting Started')
    expect(document.querySelector('.DocSearch-Hit-source')?.textContent).toBe(
      'Guide'
    )
    expect(document.querySelector('.DocSearch-Hit-path')?.textContent).toBe(
      'Guide'
    )
    expect(document.querySelector('.DocSearch-Hit-title mark')?.textContent).toBe(
      'Started'
    )
    expect(document.querySelector('.DocSearch-Hit-title img')).toBeNull()
    expect(document.querySelector('.DocSearch-Hit a')?.getAttribute('data-vitepress-hit')).toBe(
      'true'
    )
    expect(document.querySelector('.DocSearch-Hit--Child')).not.toBeNull()
    expect(document.querySelector('.DocSearch-Hit-Tree')).not.toBeNull()
    expect(document.querySelectorAll('.DocSearch-Hit')).toHaveLength(2)
    expect(document.querySelector('.DocSearch-Dropdown-Container')).not.toBeNull()
    expect(document.querySelector('.DocSearch-Hits-padded')).not.toBeNull()
    expect(document.querySelector('.DocSearch-Clear')?.hasAttribute('hidden')).toBe(false)
    expect(document.querySelector('.DocSearch-Close')?.getAttribute('aria-label')).toBe('Close')
    expect(document.querySelector('.DocSearch-Footer')?.textContent).toContain('Navigate')
    expect(document.querySelector('.DocSearch-Footer')?.textContent).toContain('Select')

    const resultLink = document.querySelector<HTMLAnchorElement>('.DocSearch-Hit a')!
    resultLink.addEventListener('click', (event) => event.preventDefault())
    resultLink.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true
    }))
    await nextTick()
    expect(instance.isOpen).toBe(true)

    resultLink.click()
    await nextTick()
    expect(instance.isOpen).toBe(false)
  })

  it('shows the DocSearch 5 no-results state for an empty response', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs'],
      getMissingResultsUrl: ({ query }) => `/report?query=${query}`,
      transformSearchClient(searchClient) {
        return {
          ...searchClient,
          async search() {
            return {
              results: [
                {
                  index: 'docs',
                  hits: [],
                  hitsPerPage: 20,
                  nbHits: 0,
                  nbPages: 0,
                  page: 0,
                  processingTimeMS: 1,
                  exhaustiveNbHits: true,
                  query: 'missing',
                  params: ''
                }
              ]
            } as never
          }
        }
      }
    })
    instances.push(instance)

    instance.open()
    await nextTick()
    const input = document.querySelector<HTMLInputElement>('.DocSearch-Input')!
    input.value = 'missing'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    await expect
      .poll(() => document.querySelector('.DocSearch-NoResults')?.textContent)
      .toContain('No results found for')
    expect(document.querySelector('.DocSearch-NoResults')?.textContent).toContain(
      'missing'
    )
    expect(document.querySelector('.DocSearch-Help a')?.getAttribute('href')).toBe(
      '/report?query=missing'
    )
  })

  it('updates an open mount when VitePress initializes the container again', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const search = vi.fn(async () => ({ results: [] }) as never)
    const transformSearchClient = (searchClient: Parameters<
      NonNullable<Parameters<typeof docsearch>[0]['transformSearchClient']>
    >[0]) => ({ ...searchClient, search })

    const first = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indexName: 'docs-en',
      initialQuery: 'english',
      placeholder: 'Search English docs',
      transformSearchClient
    })
    instances.push(first)
    first.open()
    await nextTick()

    const second = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indexName: 'docs-fr',
      initialQuery: 'français',
      placeholder: 'Rechercher',
      transformSearchClient
    })
    await nextTick()

    expect(second).toBe(first)
    expect(document.querySelectorAll('.DocSearch-Button')).toHaveLength(1)
    expect(document.querySelector<HTMLInputElement>('.DocSearch-Input')?.value).toBe(
      'français'
    )
  })

  it('reports a missing selector instead of mounting to an unknown element', () => {
    expect(() =>
      docsearch({
        appId: 'app',
        apiKey: 'key',
        container: '#missing',
        indices: ['docs']
      })
    ).toThrow('Container selector did not match any element: "#missing"')
  })
})
