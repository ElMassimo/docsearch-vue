import {
  defineComponent,
  Teleport,
  type Ref,
  type ShallowRef
} from 'vue'

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
              <div class="DocSearch DocSearch-Container" role="presentation">
                <div class="DocSearch-Modal" role="dialog" aria-modal="true" />
              </div>
            </Teleport>
          ) : null}
        </>
      )
    }
  })
}
