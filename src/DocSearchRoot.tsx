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

import { SearchButton } from './components/SearchButton'
import { SearchModal } from './SearchModal'
import type { NormalizedDocSearchOptions } from './types'

export function createDocSearchRoot(
  options: ShallowRef<NormalizedDocSearchOptions>,
  isOpen: Ref<boolean>,
  optionsVersion: Ref<number>
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
        const shortcuts = options.value.keyboardShortcuts
        const toggleShortcut =
          shortcuts?.['Ctrl/Cmd+K'] !== false &&
          event.key?.toLowerCase() === 'k' &&
          (event.metaKey || event.ctrlKey)
        const openSlashShortcut =
          shortcuts?.['/'] !== false &&
          event.key === '/' &&
          !isOpen.value &&
          !isEditingContent(event)
        const closeShortcut = event.key === 'Escape' && isOpen.value

        if (!toggleShortcut && !openSlashShortcut && !closeShortcut) return

        event.preventDefault()
        isOpen.value = closeShortcut ? false : !isOpen.value
      }

      watch(isOpen, (open) => {
        environment.document.body.classList.toggle('DocSearch--active', open)
        if (open) {
          options.value.onOpen?.()
        } else {
          options.value.onClose?.()
          searchButton.value?.focus()
        }
      })

      onMounted(() => environment.addEventListener('keydown', onKeyDown))
      onUnmounted(() => {
        environment.removeEventListener('keydown', onKeyDown)
        environment.document.body.classList.remove('DocSearch--active')
      })

      return () => (
        <>
          <SearchButton
            buttonRef={searchButton}
            environment={environment}
            keyboardShortcuts={options.value.keyboardShortcuts}
            translations={options.value.translations?.button}
            onClick={() => {
              isOpen.value = true
            }}
          />

          {isOpen.value ? (
            <Teleport
              to={options.value.portalContainer ?? environment.document.body}
            >
              <SearchModal
                key={optionsVersion.value}
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
