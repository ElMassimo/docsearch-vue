import type { Ref } from 'vue'

import type {
  ButtonTranslations,
  DocSearchKeyboardShortcuts
} from '../types'
import { SearchIcon } from './Icons'

interface SearchButtonProps {
  buttonRef: Ref<HTMLButtonElement | null>
  environment: Window
  keyboardShortcuts?: DocSearchKeyboardShortcuts
  translations?: ButtonTranslations
  onClick(): void
}

export function SearchButton({
  buttonRef,
  environment,
  keyboardShortcuts = {},
  translations = {},
  onClick
}: SearchButtonProps) {
  const buttonText = translations.buttonText ?? 'Search'
  const buttonAriaLabel = translations.buttonAriaLabel ?? 'Search'
  const shortcutEnabled = keyboardShortcuts['Ctrl/Cmd+K'] !== false
  const isApple = /Mac|iPhone|iPad|iPod/.test(environment.navigator.platform)
  const actionKeyAltText = isApple ? 'Meta' : 'Control'
  const actionKeyLabel = isApple ? '⌘' : 'Ctrl'
  const shortcut = `${actionKeyAltText}+k`

  return (
    <button
      type="button"
      class="DocSearch DocSearch-Button"
      ref={buttonRef}
      aria-label={shortcutEnabled
        ? `${buttonAriaLabel} (${shortcut})`
        : buttonAriaLabel}
      aria-keyshortcuts={shortcutEnabled ? shortcut : undefined}
      onClick={onClick}
    >
      <span class="DocSearch-Button-Container">
        <SearchIcon class="DocSearch-Search-Icon" />
        <span class="DocSearch-Button-Placeholder">{buttonText}</span>
      </span>
      <span class="DocSearch-Button-Keys">
        {shortcutEnabled ? (
          <>
            <kbd class={[
              'DocSearch-Button-Key',
              !isApple && 'DocSearch-Button-Key--ctrl'
            ].filter(Boolean).join(' ')}>
              {actionKeyLabel}
            </kbd>
            <kbd class="DocSearch-Button-Key">K</kbd>
          </>
        ) : null}
      </span>
    </button>
  )
}
