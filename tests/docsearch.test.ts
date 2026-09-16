import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

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

  it('renders grouped DocSearch 5 results through autocomplete-core', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs'],
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
    expect(document.querySelector('.DocSearch-Dropdown-Container')).not.toBeNull()
    expect(document.querySelector('.DocSearch-Hits-padded')).not.toBeNull()
    expect(document.querySelector('.DocSearch-Clear')?.hasAttribute('hidden')).toBe(false)
    expect(document.querySelector('.DocSearch-Close')?.getAttribute('aria-label')).toBe('Close')
    expect(document.querySelector('.DocSearch-Footer')?.textContent).toContain('Navigate')
    expect(document.querySelector('.DocSearch-Footer')?.textContent).toContain('Select')
  })

  it('shows the DocSearch 5 no-results state for an empty response', async () => {
    document.body.innerHTML = '<div id="docsearch"></div>'
    const instance = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indices: ['docs'],
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
  })

  it('updates an existing mount when VitePress initializes the container again', () => {
    document.body.innerHTML = '<div id="docsearch"></div>'

    const first = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indexName: 'docs-en',
      placeholder: 'Search English docs'
    })
    instances.push(first)

    const second = docsearch({
      appId: 'app',
      apiKey: 'key',
      container: '#docsearch',
      indexName: 'docs-fr',
      placeholder: 'Rechercher'
    })

    expect(second).toBe(first)
    expect(document.querySelectorAll('.DocSearch-Button')).toHaveLength(1)
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
