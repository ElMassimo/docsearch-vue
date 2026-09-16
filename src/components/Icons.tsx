import type { DocSearchHit } from '../types'

interface IconProps {
  class?: string
  size?: number
}

export function LoadingIcon(props: IconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 38 38"
      stroke="currentColor"
      stroke-opacity=".5"
      aria-hidden="true"
    >
      <g fill="none" fill-rule="evenodd" transform="translate(1 1)" stroke-width="2">
        <circle stroke-opacity=".3" cx="18" cy="18" r="18" />
        <path d="M36 18c0-9.94-8.06-18-18-18">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  )
}

export function SearchIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...props} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" />
      <path d="m16 16 5 5" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...props} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function SourceIcon({ type, ...props }: IconProps & {
  type?: DocSearchHit['type']
}) {
  if (type === 'lvl1') {
    return (
      <svg {...props} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" fill="none" stroke="currentColor" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" fill="none" stroke="currentColor" />
      </svg>
    )
  }
  if (type === 'content') {
    return (
      <svg {...props} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" fill="none" stroke="currentColor" />
      </svg>
    )
  }
  return (
    <svg {...props} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function RecentIcon(props: IconProps) {
  return (
    <svg {...props} width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3.18 6.6a8.23 8.23 0 1 1 12.93 9.94 8.23 8.23 0 0 1-11.63 0M6.44 7.25H2.55V3.36M10.45 6v5.6L13 13" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...props} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 3 6 6m-8 2 6 6m-7 1 5-5m2-8 6 6-3 2-5-5 2-3ZM4 20l4-4" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function SelectIcon(props: IconProps) {
  return (
    <svg {...props} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4v7a4 4 0 0 1-4 4H4m5-5-5 5 5 5" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function NoResultsIcon(props: IconProps) {
  return (
    <svg {...props} width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" />
      <path d="m14.5 14.5 5 5M8 8l4 4m0-4-4 4" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function ErrorIcon(props: IconProps) {
  return (
    <svg {...props} width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" />
      <path d="M12 7v6m0 4h.01" fill="none" stroke="currentColor" />
    </svg>
  )
}
