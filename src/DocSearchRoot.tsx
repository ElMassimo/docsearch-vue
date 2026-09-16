import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  Teleport,
  watch,
  type Ref,
  type ShallowRef
} from 'vue'

import { SearchModal } from './SearchModal'
import type { NormalizedDocSearchOptions } from './types'

export function createDocSearchRoot(
  options: ShallowRef<NormalizedDocSearchOptions>,
  isOpen: Ref<boolean>
) {
  return defineComponent({
    name: 'DocSearchRoot',
    setup() {
      const searchButton = ref<HTMLButtonElement | null>(null)
      const environment = options.value.environment ?? window

      function isEditingContent(event: KeyboardEvent): boolean {
        const element = event.target as HTMLElement | null
        const tagName = element?.tagName

        return Boolean(
          element?.isContentEditable ||
            tagName === 'INPUT' ||
            tagName === 'SELECT' ||
            tagName === 'TEXTAREA'
        )
      }

      function onKeyDown(event: KeyboardEvent): void {
        const toggleShortcut =
          event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
        const openSlashShortcut =
          event.key === '/' && !isOpen.value && !isEditingContent(event)
        const closeShortcut = event.key === 'Escape' && isOpen.value

        if (!toggleShortcut && !openSlashShortcut && !closeShortcut) return

        event.preventDefault()
        isOpen.value = closeShortcut ? false : !isOpen.value
      }

      watch(isOpen, (open) => {
        environment.document.body.classList.toggle('DocSearch--active', open)
        if (!open) searchButton.value?.focus()
      })

      onMounted(() => environment.addEventListener('keydown', onKeyDown))
      onUnmounted(() => {
        environment.removeEventListener('keydown', onKeyDown)
        environment.document.body.classList.remove('DocSearch--active')
      })

      return () => (
        <>
          <button
            type="button"
            class="DocSearch DocSearch-Button"
            ref={searchButton}
            aria-label="Search"
            onClick={() => {
              isOpen.value = true
            }}
          >
            <span class="DocSearch-Button-Placeholder">
              {options.value.placeholder ?? 'Search'}
            </span>
          </button>

          {isOpen.value ? (
            <Teleport to="body">
              <SearchModal
                options={options.value}
                onClose={() => {
                  isOpen.value = false
                }}
              />
            </Teleport>
          ) : null}
        </>
      )
    }
  })
}
