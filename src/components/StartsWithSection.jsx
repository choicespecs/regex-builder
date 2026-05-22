import Section from './Section'
import { patternFor } from '../regexEngine'

const TYPES = [
  { value: 'literal',       label: 'Literal text' },
  { value: 'digit',         label: 'Digit (0–9)' },
  { value: 'letter',        label: 'Letter (a–z, A–Z)' },
  { value: 'word-boundary', label: 'Word boundary (\\b)' },
]

export default function StartsWithSection({ config, onChange }) {
  const pattern = patternFor(config.type, config.value)

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
          onChange={e => onChange({ type: e.target.value, value: '' })}
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

      {config.type === 'word-boundary' && (
        <p className="field-hint">
          \b is a zero-width assertion — it matches a position between a word character and a
          non-word character, consuming no character itself. Nothing to configure.
        </p>
      )}

      {config.type !== 'literal' && config.type !== 'word-boundary' && (
        <div>
          <span className="field-label">Pattern</span>
          <code className="pattern-chip">{pattern || '\\d'}</code>
        </div>
      )}

      {config.type === 'word-boundary' && (
        <div>
          <span className="field-label">Pattern</span>
          <code className="pattern-chip">\b</code>
        </div>
      )}
    </Section>
  )
}
