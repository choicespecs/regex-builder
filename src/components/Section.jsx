export default function Section({ title, enabled, onToggle, children }) {
  return (
    <div className={`section${enabled ? ' section--active' : ''}`}>
      <label className="section-header">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
        />
        <span>{title}</span>
      </label>
      {enabled && <div className="section-body">{children}</div>}
    </div>
  )
}
