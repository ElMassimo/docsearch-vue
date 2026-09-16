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

export function Footer() {
  return (
    <>
      <ul class="DocSearch-Commands">
        <li>
          <kbd class="DocSearch-Commands-Key"><CommandIcon direction="down" /></kbd>
          <kbd class="DocSearch-Commands-Key"><CommandIcon direction="up" /></kbd>
          <span class="DocSearch-Label">Navigate</span>
        </li>
        <li>
          <kbd class="DocSearch-Commands-Key"><CommandIcon direction="enter" /></kbd>
          <span class="DocSearch-Label">Select</span>
        </li>
        <li>
          <kbd class="DocSearch-Commands-Key"><span class="DocSearch-Escape-Key">ESC</span></kbd>
          <span class="DocSearch-Label">Close</span>
        </li>
      </ul>
      <div class="DocSearch-Footer-Actions">
        <div class="DocSearch-Logo">
          <a
            href="https://www.algolia.com/ref/docsearch/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="DocSearch-Label">Powered by</span>
            <strong aria-label="Algolia">algolia</strong>
          </a>
        </div>
      </div>
    </>
  )
}
