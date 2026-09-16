import type { VNodeChild } from 'vue'

import type { FooterTranslations } from '../types'
import { AlgoliaLogo } from './AlgoliaLogo'

function CommandIcon(props: { direction: 'up' | 'down' | 'enter' }) {
  const path = {
    up: 'm5 12 7-7 7 7M12 19V5',
    down: 'M12 5v14m7-7-7 7-7-7',
    enter: 'M20 4v7a4 4 0 0 1-4 4H4m5-5-5 5 5 5'
  }[props.direction]

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" />
    </svg>
  )
}

export function Footer({
  action,
  hostname,
  translations = {}
}: {
  action?: VNodeChild | (() => VNodeChild)
  hostname: string
  translations?: FooterTranslations
}) {
  const renderedAction = typeof action === 'function' ? action() : action
  const {
    navigateText = 'Navigate',
    selectText = 'Select',
    closeText = 'Close'
  } = translations

  return (
    <>
      <ul class="DocSearch-Commands">
        <li>
          <kbd class="DocSearch-Commands-Key"><CommandIcon direction="down" /></kbd>
          <kbd class="DocSearch-Commands-Key"><CommandIcon direction="up" /></kbd>
          <span class="DocSearch-Label">{navigateText}</span>
        </li>
        <li>
          <kbd class="DocSearch-Commands-Key"><CommandIcon direction="enter" /></kbd>
          <span class="DocSearch-Label">{selectText}</span>
        </li>
        <li>
          <kbd class="DocSearch-Commands-Key"><span class="DocSearch-Escape-Key">ESC</span></kbd>
          <span class="DocSearch-Label">{closeText}</span>
        </li>
      </ul>
      <div class="DocSearch-Footer-Actions">
        {renderedAction ? (
          <div class="DocSearch-Footer-Action">{renderedAction}</div>
        ) : null}
        <div class="DocSearch-Logo">
          <AlgoliaLogo hostname={hostname} translations={translations} />
        </div>
      </div>
    </>
  )
}
