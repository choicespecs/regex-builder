import Section from './Section'
import { patternFor, applyCount } from '../regexEngine'

const TYPES = [
  { value: 'literal',       label: 'Literal text' },
  { value: 'digit',         label: 'Digit (0–9)' },
  { value: 'letter',        label: 'Letter (a–z, A–Z)' },
  { value: 'word-boundary', label: 'Word boundary (\\b)' },
]

const COUNT_TYPES = [
  { value: 'once',         label: 'exactly one' },
  { value: 'one-or-more',  label: 'one or more (+)' },
  { value: 'zero-or-more', label: 'zero or more (*)' },
  { value: 'exactly',      label: 'exactly N…' },
  { value: 'at-least',     label: 'at least N…' },
]

const NEEDS_COUNT = new Set(['digit', 'letter'])
const NEEDS_N     = new Set(['exactly', 'at-least'])

export default function StartsWithSection({ config, onChange }) {
  const countType = config.countType || 'once'
  const countMin  = config.countMin  || 1
  const base      = patternFor(config.type, config.value)
  const pattern   = applyCount(base, countType, countMin)

  return (
    <Section
      title="Starts with"
      enabled={config.enabled}
      onToggle={enabled => onChange({ enabled })}
    >
      <div>
        <span className="field-label">Type</span>
        <select
          value={config.type}
          onChange={e => onChange({ type: e.target.value, value: '', countType: 'once', countMin: 1 })}
        >
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {config.type === 'literal' && (
        <div>
          <span className="field-label">Value</span>
          <input
            type="text"
            placeholder="e.g. https"
            value={config.value}
            onChange={e => onChange({ value: e.target.value })}
          />
        </div>
      )}

      {config.type === 'digit' && (
        <div>
          <span className="field-label">Restrict to (optional)</span>
          <input
            type="text"
            placeholder="e.g. 0-5  or  13  or  02468"
            value={config.value}
            onChange={e => onChange({ value: e.target.value })}
          />
          <span className="field-hint">
            Blank = any digit (\d). Fill to restrict: <code>0-5</code> → <code>[0-5]</code>
          </span>
        </div>
      )}

      {config.type === 'letter' && (
        <div>
          <span className="field-label">Restrict to (optional)</span>
          <input
            type="text"
            placeholder="e.g. a-f  or  aeiou  or  A-Z"
            value={config.value}
            onChange={e => onChange({ value: e.target.value })}
          />
          <span className="field-hint">
            Blank = any letter ([a-zA-Z]). Fill to restrict: <code>a-z</code> → <code>[a-z]</code>
          </span>
        </div>
      )}

      {NEEDS_COUNT.has(config.type) && (
        <div>
          <span className="field-label">Count</span>
          <div className="row">
            <select
              value={countType}
              onChange={e => onChange({ countType: e.target.value })}
            >
              {COUNT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {NEEDS_N.has(countType) && (
              <input
                type="number"
                min={1}
                value={countMin}
                onChange={e => onChange({ countMin: Math.max(1, parseInt(e.target.value) || 1) })}
                style={{ maxWidth: '5rem' }}
              />
            )}
          </div>
        </div>
      )}

      {config.type === 'word-boundary' && (
        <p className="field-hint">
          \b is zero-width — it marks a position between a word character and a
          non-word character without consuming any character. Nothing to configure.
        </p>
      )}

      {config.type !== 'literal' && (
        <div>
          <span className="field-label">Pattern</span>
          <code className="pattern-chip">{pattern || base || '\\b'}</code>
        </div>
      )}
    </Section>
  )
}
