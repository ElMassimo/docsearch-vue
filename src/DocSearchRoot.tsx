import {
  defineComponent,
  Teleport,
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
      return () => (
        <>
          <button
            type="button"
            class="DocSearch DocSearch-Button"
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
