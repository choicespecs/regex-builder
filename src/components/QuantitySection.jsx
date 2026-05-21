import Section from './Section'

const TYPES = [
  { value: 'exactly',   label: 'Exactly' },
  { value: 'at-least',  label: 'At least' },
  { value: 'between',   label: 'Between' },
]

export default function QuantitySection({ config, onChange }) {
  return (
    <Section
      title="Quantity"
      enabled={config.enabled}
      onToggle={enabled => onChange({ enabled })}
    >
      <span className="field-hint" style={{ marginTop: 0 }}>Applies to the Contains section</span>
      <div>
        <span className="field-label">Repeat</span>
        <select
          value={config.type}
          onChange={e => onChange({ type: e.target.value })}
        >
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="row">
        <div>
          <span className="field-label">{config.type === 'between' ? 'Min' : 'Count'}</span>
          <input
            type="number"
            min={1}
            value={config.min}
            onChange={e => onChange({ min: Math.max(1, Number(e.target.value)) })}
          />
        </div>
        {config.type === 'between' && (
          <div>
            <span className="field-label">Max</span>
            <input
              type="number"
              min={config.min + 1}
              value={config.max}
              onChange={e => onChange({ max: Math.max(config.min + 1, Number(e.target.value)) })}
            />
          </div>
        )}
      </div>
    </Section>
  )
}
