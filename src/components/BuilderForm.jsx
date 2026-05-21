import StartsWithSection from './StartsWithSection'
import ContainsSection from './ContainsSection'
import EndsWithSection from './EndsWithSection'
import QuantitySection from './QuantitySection'
import CaptureGroupSection from './CaptureGroupSection'
import './form.css'

export default function BuilderForm({ config, onChange }) {
  return (
    <>
      <h2 className="panel-title">Builder</h2>
      <StartsWithSection
        config={config.startsWith}
        onChange={changes => onChange('startsWith', changes)}
      />
      <ContainsSection
        config={config.contains}
        onChange={changes => onChange('contains', changes)}
      />
      <EndsWithSection
        config={config.endsWith}
        onChange={changes => onChange('endsWith', changes)}
      />
      <QuantitySection
        config={config.quantity}
        onChange={changes => onChange('quantity', changes)}
      />
      <CaptureGroupSection
        config={config.captureGroup}
        onChange={changes => onChange('captureGroup', changes)}
      />
    </>
  )
}
