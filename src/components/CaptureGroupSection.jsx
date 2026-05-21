import Section from './Section'

export default function CaptureGroupSection({ config, onChange }) {
  return (
    <Section
      title="Capture group"
      enabled={config.enabled}
      onToggle={enabled => onChange({ enabled })}
    >
      <div>
        <span className="field-label">Group name (optional)</span>
        <input
          type="text"
          placeholder="e.g. year  →  (?<year>…)"
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
        />
        <span className="field-hint">Leave blank for an unnamed group ( … )</span>
      </div>
    </Section>
  )
}
