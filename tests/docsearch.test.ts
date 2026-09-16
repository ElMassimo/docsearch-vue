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
