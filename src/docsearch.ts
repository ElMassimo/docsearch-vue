import { createApp, ref, shallowRef, type App } from 'vue'

import { createDocSearchRoot } from './DocSearchRoot'
import { normalizeOptions } from './normalizeOptions'
import type { DocSearchOptions, NormalizedDocSearchOptions } from './types'

export interface DocSearchInstance {
  readonly isReady: boolean
  readonly isOpen: boolean
  open(): void
  close(): void
  destroy(): void
}

interface MountedDocSearch {
  app: App
  instance: DocSearchInstance
  options: ReturnType<typeof shallowRef<NormalizedDocSearchOptions>>
}

const mountedDocSearch = new WeakMap<HTMLElement, MountedDocSearch>()

function resolveContainer(options: DocSearchOptions): HTMLElement {
  if (typeof options.container !== 'string') {
    return options.container
  }

  const document = options.environment?.document ?? globalThis.document
  const container = document?.querySelector<HTMLElement>(options.container)

  if (!container) {
    throw new Error(
      `Container selector did not match any element: "${options.container}"`
    )
  }

  return container
}

export default function docsearch(
  input: DocSearchOptions
): DocSearchInstance {
  const container = resolveContainer(input)
  const normalizedOptions = normalizeOptions(input)
  const mounted = mountedDocSearch.get(container)

  if (mounted) {
    mounted.options.value = normalizedOptions
    return mounted.instance
  }

  const options = shallowRef(normalizedOptions)
  const isOpen = ref(false)
  const app = createApp(createDocSearchRoot(options, isOpen))
  let isReady = false

  const instance: DocSearchInstance = {
    open() {
      if (isReady) isOpen.value = true
    },
    close() {
      if (isReady) isOpen.value = false
    },
    destroy() {
      if (!isReady) return

      app.unmount()
      mountedDocSearch.delete(container)
      isReady = false
    },
    get isReady() {
      return isReady
    },
    get isOpen() {
      return isOpen.value
    }
  }

  app.mount(container)
  isReady = true
  mountedDocSearch.set(container, { app, instance, options })
  normalizedOptions.onReady?.()

  return instance
}
