interface IconProps {
  class?: string
  size?: number
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

export function SourceIcon(props: IconProps) {
  return (
    <svg {...props} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16" fill="none" stroke="currentColor" />
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
