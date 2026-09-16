import type { FacetFilters, SearchParamsObject } from 'algoliasearch/lite'

import type { DocSearchFacet, DocSearchIndex } from './types'

export type FacetSelections = Record<string, string[]>

const MAX_FACETS = 5

export function normalizeFacets(facets: DocSearchFacet[] = []): DocSearchFacet[] {
  const normalized = new Map<string, DocSearchFacet>()

  for (const facet of facets) {
    const key = facet.key.trim().toLowerCase()
    if (!key || normalized.has(key)) continue
    if (normalized.size >= MAX_FACETS) break
    normalized.set(key, { ...facet, key })
  }

  return [...normalized.values()]
}

export function getFacetLabel(facet: DocSearchFacet): string {
  return facet.label ?? facet.key
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function parseFacetFilter(filter: string): { key: string; value: string } | null {
  const separator = filter.indexOf(':')
  if (separator <= 0 || separator === filter.length - 1) return null
  return { key: filter.slice(0, separator), value: filter.slice(separator + 1) }
}

export function deriveFacetSelections(indices: DocSearchIndex[]): FacetSelections {
  const selections: FacetSelections = {}

  for (const index of indices) {
    const filters = index.searchParameters?.facetFilters
    for (const filter of Array.isArray(filters) ? filters : [filters]) {
      if (typeof filter === 'string') {
        const parsed = parseFacetFilter(filter)
        if (parsed) selections[parsed.key] = [parsed.value]
        continue
      }
      if (!Array.isArray(filter) || filter.length === 0) continue

      const parsed = filter.map((entry) =>
        typeof entry === 'string' ? parseFacetFilter(entry) : null
      )
      const key = parsed[0]?.key
      if (key && parsed.every((entry) => entry?.key === key)) {
        selections[key] = parsed.map((entry) => entry!.value)
      }
    }
  }

  return selections
}

function getFilterKey(filter: FacetFilters[number]): string | null {
  if (typeof filter !== 'string') return null
  return parseFacetFilter(filter)?.key ?? null
}

export function createFacetFilters(
  configured: SearchParamsObject['facetFilters'],
  selections: FacetSelections
): SearchParamsObject['facetFilters'] {
  const entries = Object.entries(selections)
  if (entries.length === 0) return configured

  const overridden = new Set(entries.map(([facet]) => facet))
  const configuredFilters: FacetFilters = Array.isArray(configured)
    ? configured
    : configured
      ? [configured]
      : []
  const remaining = configuredFilters.filter((filter) => {
    if (typeof filter === 'string') return !overridden.has(getFilterKey(filter) ?? '')
    return !filter.every((entry) => overridden.has(getFilterKey(entry) ?? ''))
  })
  const selected: FacetFilters = []
  for (const [facet, values] of entries) {
    if (values.length === 1) {
      selected.push(`${facet}:${values[0]}`)
    } else if (values.length > 1) {
      selected.push(values.map((value) => `${facet}:${value}`))
    }
  }

  return [...remaining, ...selected]
}
