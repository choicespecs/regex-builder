import Section from './Section'

const TYPES = [
  { value: 'literal',    label: 'Literal text' },
  { value: 'any-of',     label: 'Any of these characters' },
  { value: 'digit',      label: 'Digit (0–9)' },
  { value: 'letter',     label: 'Letter (a–z, A–Z)' },
  { value: 'whitespace', label: 'Whitespace' },
  { value: 'any',        label: 'Any character (.)' },
]

const NEEDS_VALUE = new Set(['literal', 'any-of'])

export default function ContainsSection({ config, onChange }) {
  return (
    <Section
      title="Contains"
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
      {NEEDS_VALUE.has(config.type) && (
        <div>
          <span className="field-label">
            {config.type === 'any-of' ? 'Characters' : 'Value'}
          </span>
          <input
            type="text"
            placeholder={config.type === 'any-of' ? 'e.g. abc123' : 'e.g. hello'}
            value={config.value}
            onChange={e => onChange({ value: e.target.value })}
          />
          {config.type === 'any-of' && (
            <span className="field-hint">Matches any single character you list</span>
          )}
        </div>
      )}
    </Section>
  )
}
