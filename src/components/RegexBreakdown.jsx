import './RegexBreakdown.css'

const SECTION_COLORS = {
  startsWith:   'token--start',
  contains:     'token--contains',
  endsWith:     'token--end',
  captureGroup: 'token--capture',
}

export default function RegexBreakdown({ breakdown }) {
  if (!breakdown.length) return null

  return (
    <div className="breakdown">
      <h3 className="breakdown-title">How this regex works</h3>
      <div className="breakdown-tokens">
        {breakdown.map((item, i) => (
          <span key={i} className={`token ${SECTION_COLORS[item.section] || ''}`}>
            <code>{item.fragment}</code>
          </span>
        ))}
      </div>
      <ol className="breakdown-list">
        {breakdown.map((item, i) => (
          <li key={i} className="breakdown-item">
            <div className="breakdown-item-header">
              <code className={`breakdown-frag ${SECTION_COLORS[item.section] || ''}`}>{item.fragment}</code>
              <span className="breakdown-label">{item.label}</span>
            </div>
            <p className="breakdown-desc">{item.description}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
