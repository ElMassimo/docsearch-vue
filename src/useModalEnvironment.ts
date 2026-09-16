import { onMounted, onUnmounted, type Ref } from 'vue'

import type { DocSearchAutocomplete } from './types'

interface ModalEnvironmentRefs {
  container: Ref<HTMLDivElement | null>
  dropdown: Ref<HTMLDivElement | null>
  form: Ref<HTMLFormElement | null>
  input: Ref<HTMLInputElement | null>
  modal: Ref<HTMLDivElement | null>
}

export function useModalEnvironment(
  autocomplete: DocSearchAutocomplete,
  refs: ModalEnvironmentRefs,
  environment: Window,
  theme?: 'dark' | 'light'
): void {
  const initialScrollY = environment.scrollY
  const initialTheme = environment.document.documentElement.dataset.theme
  let removeTouchEvents = () => {}

  function trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !refs.container.value) return

    const focusable = Array.from(
      refs.container.value.querySelectorAll<HTMLElement>(
        'a[href]:not([disabled]), button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden])'
      )
    )
    const first = focusable[0]
    const last = focusable.at(-1)

    if (!first || !last) return
    if (event.shiftKey && environment.document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && environment.document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function setViewportHeight(): void {
    refs.modal.value?.style.setProperty(
      '--docsearch-vh',
      `${environment.innerHeight * 0.01}px`
    )
  }

  onMounted(() => {
    const { input, form, dropdown, container } = refs
    if (theme) environment.document.documentElement.dataset.theme = theme
    if (input.value && form.value && dropdown.value) {
      const { onTouchMove, onTouchStart } = autocomplete.getEnvironmentProps({
        inputElement: input.value,
        formElement: form.value,
        panelElement: dropdown.value
      })
      const touchStart = onTouchStart as EventListener
      const touchMove = onTouchMove as EventListener
      environment.addEventListener('touchstart', touchStart)
      environment.addEventListener('touchmove', touchMove)
      removeTouchEvents = () => {
        environment.removeEventListener('touchstart', touchStart)
        environment.removeEventListener('touchmove', touchMove)
      }
    }

    container.value?.addEventListener('keydown', trapFocus)
    const scrollbarWidth = environment.innerWidth - environment.document.body.clientWidth
    environment.document.body.style.marginInlineEnd = `${scrollbarWidth}px`
    setViewportHeight()
    environment.addEventListener('resize', setViewportHeight)
  })

  onUnmounted(() => {
    removeTouchEvents()
    refs.container.value?.removeEventListener('keydown', trapFocus)
    environment.removeEventListener('resize', setViewportHeight)
    environment.document.body.style.marginInlineEnd = ''
    if (theme) {
      if (initialTheme === undefined) {
        delete environment.document.documentElement.dataset.theme
      } else {
        environment.document.documentElement.dataset.theme = initialTheme
      }
    }
    if (environment.scrollY !== initialScrollY) {
      environment.scrollTo?.(0, initialScrollY)
    }
  })
}
