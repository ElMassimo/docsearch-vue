import type { FooterTranslations } from '../types'

export function AlgoliaLogo({
  hostname,
  translations = {}
}: {
  hostname: string
  translations?: FooterTranslations
}) {
  const poweredByText = translations.poweredByText ?? 'Powered by'
  const href = new URL('https://www.algolia.com/ref/docsearch/')
  href.search = new URLSearchParams({
    utm_source: hostname,
    utm_medium: 'referral',
    utm_content: 'powered_by',
    utm_campaign: 'docsearch'
  }).toString()

  return (
    <a href={href.toString()} target="_blank" rel="noopener noreferrer">
      <span class="DocSearch-Label">{poweredByText}</span>
      <svg
        width="80"
        height="24"
        viewBox="0 0 80 24"
        aria-label="Algolia"
        role="img"
      >
        <g fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="10" cy="12" r="8" />
          <circle cx="10" cy="12" r="3" />
          <path d="m12.5 10.2 5-4.2" stroke-linecap="round" />
        </g>
        <text
          x="21"
          y="17"
          fill="currentColor"
          font-family="Arial, sans-serif"
          font-size="15"
          font-weight="600"
        >
          algolia
        </text>
      </svg>
    </a>
  )
}
