export const DEFAULT_CONFIG = {
  startsWith:   { enabled: false, type: 'literal', value: '' },
  contains:     { enabled: false, type: 'literal', value: '' },
  endsWith:     { enabled: false, type: 'literal', value: '' },
  quantity:     { enabled: false, type: 'exactly', min: 1, max: 2 },
  captureGroup: { enabled: false, name: '' },
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function patternFor(type, value) {
  switch (type) {
    case 'literal':        return escapeRegex(value || '')
    case 'digit':          return value ? `[${value}]` : '\\d'
    case 'letter':         return value ? `[${value}]` : '[a-zA-Z]'
    case 'word-boundary':  return '\\b'
    case 'whitespace':     return '\\s'
    case 'any':            return '.'
    case 'any-of':         return value ? `[${escapeRegex(value)}]` : ''
    default:               return ''
  }
}

function quantify(pattern, qty) {
  if (!pattern || !qty.enabled) return pattern
  const { type, min, max } = qty
  if (type === 'exactly')  return `${pattern}{${min}}`
  if (type === 'at-least') return `${pattern}{${min},}`
  if (type === 'between')  return `${pattern}{${min},${max}}`
  return pattern
}

function describeType(type, value) {
  switch (type) {
    case 'literal':       return `Matches the exact text "${value}"`
    case 'digit':         return 'Matches any single digit 0–9. Equivalent to [0-9]'
    case 'letter':        return 'Matches any single ASCII letter a–z or A–Z. Equivalent to [a-zA-Z]'
    case 'word-boundary': return 'Matches at a word boundary — the position between a \\w and a \\W character. Zero-width: no character is consumed'
    case 'whitespace':    return 'Matches any whitespace character: space, tab (\\t), newline (\\n), carriage return (\\r)'
    case 'any':           return 'Matches any single character except newline. Use [\\s\\S] to also match newlines'
    case 'any-of':        return `Character class — matches any ONE character from the set [${value}]`
    default:              return ''
  }
}

function describeQty(qty) {
  if (qty.type === 'exactly')  return `exactly ${qty.min} time${qty.min !== 1 ? 's' : ''} — {${qty.min}}`
  if (qty.type === 'at-least') return `at least ${qty.min} time${qty.min !== 1 ? 's' : ''} — {${qty.min},}`
  if (qty.type === 'between')  return `between ${qty.min} and ${qty.max} times — {${qty.min},${qty.max}}`
  return ''
}

// Returns an array of {fragment, section, label, description} for the current config.
// Used by RegexBreakdown to explain each token in plain English.
export function getBreakdown(config) {
  const { startsWith, contains, endsWith, quantity, captureGroup } = config
  const items = []

  if (startsWith.enabled) {
    if (startsWith.type === 'word-boundary') {
      items.push({ fragment: '\\b', section: 'startsWith', label: 'Word boundary', description: describeType('word-boundary') })
    } else {
      items.push({ fragment: '^', section: 'startsWith', label: 'Start anchor', description: 'Asserts the match must begin at the very start of the string. Does not consume a character.' })
      const p = patternFor(startsWith.type, startsWith.value)
      if (p) items.push({ fragment: p, section: 'startsWith', label: 'Starts with', description: describeType(startsWith.type, startsWith.value) })
    }
  }

  if (contains.enabled) {
    const base = patternFor(contains.type, contains.value)
    const withQty = quantify(base, quantity)
    if (withQty) {
      items.push({
        fragment: withQty,
        section: 'contains',
        label: quantity.enabled ? 'Contains + Quantity' : 'Contains',
        description: describeType(contains.type, contains.value) +
          (quantity.enabled ? `. Quantifier: ${describeQty(quantity)}.` : ''),
      })
    }
  }

  if (endsWith.enabled) {
    const p = patternFor(endsWith.type, endsWith.value)
    if (p) items.push({ fragment: p, section: 'endsWith', label: 'Ends with', description: describeType(endsWith.type, endsWith.value) })
    items.push({ fragment: '$', section: 'endsWith', label: 'End anchor', description: 'Asserts the match must end at the very end of the string. Does not consume a character.' })
  }

  if (captureGroup.enabled && items.length > 0) {
    const name = captureGroup.name
    items.push({
      fragment: name ? `(?<${name}>…)` : '(…)',
      section: 'captureGroup',
      label: name ? `Named capture group "${name}"` : 'Capture group',
      description: name
        ? `Wraps the entire pattern in a named group. In JavaScript: match.groups.${name} gives you the captured text.`
        : 'Wraps the entire pattern in a capturing group. In JavaScript: match[1] gives you the captured text.',
    })
  }

  return items
}

// Quantity applies to the "contains" section.
export function buildRegex(config) {
  const { startsWith, contains, endsWith, quantity, captureGroup } = config

  let prefix = ''
  let startPattern = ''
  if (startsWith.enabled) {
    if (startsWith.type === 'word-boundary') {
      prefix = '\\b'
    } else {
      prefix = '^'
      startPattern = patternFor(startsWith.type, startsWith.value)
    }
  }

  let containsPattern = ''
  if (contains.enabled) {
    containsPattern = quantify(patternFor(contains.type, contains.value), quantity)
  }

  let endPattern = ''
  let suffix = ''
  if (endsWith.enabled) {
    endPattern = patternFor(endsWith.type, endsWith.value)
    suffix = '$'
  }

  let inner = startPattern + containsPattern + endPattern

  if (captureGroup.enabled && inner) {
    inner = captureGroup.name
      ? `(?<${captureGroup.name}>${inner})`
      : `(${inner})`
  }

  return prefix + inner + suffix
}
