import Section from './Section'

const TYPES = [
  { value: 'literal',    label: 'Literal text' },
  { value: 'digit',      label: 'Digit (0–9)' },
  { value: 'letter',     label: 'Letter (a–z, A–Z)' },
  { value: 'whitespace', label: 'Whitespace' },
]

const PATTERN_PREVIEW = {
  digit:      { fragment: '\\d',      hint: 'Matches any single digit 0–9' },
  letter:     { fragment: '[a-zA-Z]', hint: 'Matches any single letter a–z or A–Z' },
  whitespace: { fragment: '\\s',      hint: 'Matches a space, tab, newline, or carriage return' },
}

export default function EndsWithSection({ config, onChange }) {
  const preview = PATTERN_PREVIEW[config.type]
  return (
    <Section
      title="Ends with"
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
            placeholder="e.g. .com"
            value={config.value}
            onChange={e => onChange({ value: e.target.value })}
          />
        </div>
      )}
      {preview && (
        <div>
          <span className="field-label">Pattern</span>
          <code className="pattern-chip">{preview.fragment}</code>
          <p className="pattern-chip-hint">{preview.hint}</p>
        </div>
      )}
    </Section>
  )
}
