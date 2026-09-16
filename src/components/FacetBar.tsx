import { defineComponent, ref, type PropType } from 'vue'

import { getFacetLabel, type FacetSelections } from '../facets'
import type { DocSearchFacet, FacetTranslations } from '../types'
import { CloseIcon } from './Icons'

export interface VisibleFacet extends DocSearchFacet {
  values: string[]
}

interface FacetBarProps {
  facets: VisibleFacet[]
  selections: FacetSelections
  translations?: FacetTranslations
  onSelectionChange(facet: string, values: string[]): void
  onClear(): void
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const FacetBar = defineComponent({
  name: 'DocSearchFacetBar',
  props: {
    facets: {
      type: Array as PropType<VisibleFacet[]>,
      required: true
    },
    selections: {
      type: Object as PropType<FacetSelections>,
      required: true
    },
    translations: Object as PropType<FacetTranslations>,
    onSelectionChange: {
      type: Function as PropType<FacetBarProps['onSelectionChange']>,
      required: true
    },
    onClear: {
      type: Function as PropType<FacetBarProps['onClear']>,
      required: true
    }
  },
  setup(props) {
    const openFacet = ref<string | null>(null)
  const translations = props.translations ?? {}
  const allLabel = translations.defaultValueLabel ?? 'All'
  const selectedLabel = translations.facetMenuTriggerAriaLabel ?? 'selected'

  function toggleValue(facet: string, value: string): void {
    const current = props.selections[facet] ?? []
    const next = current.includes(value)
      ? current.filter((selected) => selected !== value)
      : [...current, value]
    props.onSelectionChange(facet, next)
  }

  return () => {
    if (props.facets.length === 0) return null
    const visibleKeys = new Set(props.facets.map((facet) => facet.key))
    const selected = Object.entries(props.selections).flatMap(([key, values]) =>
      visibleKeys.has(key) ? values.map((value) => ({ key, value })) : []
    )

    return (
      <>
        <div
          class="DocSearch-FacetBar"
          role="group"
          aria-label={translations.facetsAriaLabel ?? 'Search filters'}
        >
          {props.facets.map((facet) => {
            const label = getFacetLabel(facet)
            const values = props.selections[facet.key] ?? []
            const isOpen = openFacet.value === facet.key

            return (
              <div class="DocSearch-Menu" key={facet.key}>
                <button
                  type="button"
                  class="DocSearch-Menu-Trigger"
                  data-popup-open={isOpen ? '' : undefined}
                  data-has-selection={values.length > 0}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-label={values.length
                    ? `${label}, ${values.join(', ')} ${selectedLabel}`
                    : label}
                  onClick={() => {
                    openFacet.value = isOpen ? null : facet.key
                  }}
                >
                  <span>{capitalize(label)}</span>
                  <ChevronIcon />
                </button>
                <div
                  class={['DocSearch-Menu-content', isOpen && 'open']
                    .filter(Boolean).join(' ')}
                  role="menu"
                  aria-label={label}
                >
                  <button
                    type="button"
                    class="DocSearch-Menu-item DocSearch-Menu-ResetItem"
                    role="menuitem"
                    onClick={() => props.onSelectionChange(facet.key, [])}
                  >
                    {allLabel} {label}
                  </button>
                  {facet.values.map((value) => {
                    const checked = values.includes(value)
                    return (
                      <button
                        type="button"
                        class="DocSearch-Menu-item DocSearch-Menu-CheckboxItem"
                        role="menuitemcheckbox"
                        aria-checked={checked}
                        data-checked={checked ? '' : undefined}
                        onClick={() => toggleValue(facet.key, value)}
                      >
                        <span class="DocSearch-Menu-CheckboxItem-Indicator">
                          {checked ? '✓' : ''}
                        </span>
                        {capitalize(value)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {selected.length ? (
          <div
            class="DocSearch-FacetSelectionBar"
            role="group"
            aria-label={
              translations.selectedFacetsAriaLabel ?? 'Selected search filters'
            }
          >
            {selected.map(({ key, value }) => {
              const facet = props.facets.find((candidate) => candidate.key === key)!
              return (
                <span class="DocSearch-Chip" key={`${key}:${value}`}>
                  {capitalize(value)}
                  <button
                    type="button"
                    class="DocSearch-Chip-Dismiss"
                    aria-label={`${translations.clearFacetAriaLabel ?? 'Clear filter:'} ${capitalize(value)} (${getFacetLabel(facet)})`}
                    onClick={() => toggleValue(key, value)}
                  >
                    <CloseIcon />
                  </button>
                </span>
              )
            })}
            <button
              type="button"
              class="DocSearch-FacetSelectionBar-Action"
              onClick={props.onClear}
            >
              {translations.clearAllLabel ?? 'Clear all'}
            </button>
          </div>
        ) : null}
      </>
    )
  }
  }
})

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" />
    </svg>
  )
}
