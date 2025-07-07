import type { Matcher, MultiaddrMatcher } from './index.js'
import { type Multiaddr, type Component, CODE_P2P, CODE_CERTHASH } from '@multiformats/multiaddr'

export const func = (fn: (val: Component) => boolean): Matcher => {
  return {
    match: (vals) => {
      if (vals.length < 1) {
        return false
      }

      if (fn(vals[0])) {
        return vals.slice(1)
      }

      return false
    },
    pattern: 'fn'
  }
}

export const code = (code: number): Matcher => {
  return {
    match: (vals) => {
      const component = vals[0]

      if (component?.code !== code) {
        return false
      }

      return vals.slice(1)
    },
    pattern: '/p2p/{peerid}'
  }
}

export const value = (code: number, value?: string): Matcher => {
  return {
    match: (vals) => {
      const component = vals[0]

      if (component?.code !== code) {
        return false
      }

      if (component.value == null) {
        return false
      }

      if (value != null && component.value !== value) {
        return false
      }

      return vals.slice(1)
    },
    pattern: '/p2p/{peerid}'
  }
}

export const optional = (matcher: Matcher): Matcher => {
  return {
    match: (vals) => {
      const result = matcher.match(vals)

      if (result === false) {
        return vals
      }

      return result
    },
    pattern: `optional(${matcher.pattern})`
  }
}

export const or = (...matchers: Matcher[]): Matcher => {
  return {
    match: (vals) => {
      let matches: Component[] | undefined

      for (const matcher of matchers) {
        const result = matcher.match(vals)

        // no match
        if (result === false) {
          continue
        }

        // choose greediest matcher
        if (matches == null || result.length < matches.length) {
          matches = result
        }
      }

      if (matches == null) {
        return false
      }

      return matches
    },
    pattern: `or(${matchers.map(m => m.pattern).join(', ')})`
  }
}

export const and = (...matchers: Matcher[]): Matcher => {
  return {
    match: (vals) => {
      for (const matcher of matchers) {
        // pass what's left of the array
        const result = matcher.match(vals)

        // no match
        if (result === false) {
          return false
        }

        vals = result
      }

      return vals
    },
    pattern: `and(${matchers.map(m => m.pattern).join(', ')})`
  }
}

export function fmt (...matchers: Matcher[]): MultiaddrMatcher {
  function match (ma: Multiaddr): Component[] | false {
    let parts = ma.getComponents()

    for (const matcher of matchers) {
      const result = matcher.match(parts)

      if (result === false) {
        return false
      }

      parts = result
    }

    return parts
  }

  function matches (ma: Multiaddr): boolean {
    const result = match(ma)

    return result !== false
  }

  function exactMatch (ma: Multiaddr): boolean {
    const result = match(ma)

    if (result === false) {
      return false
    }

    return result.length === 0
  }

  return {
    matchers,
    matches,
    exactMatch
  }
}
