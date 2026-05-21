import { useState, useMemo } from 'react'
import './TestPanel.css'

function getMatches(text, regexStr) {
  if (!regexStr || !text) return { segments: [], count: 0, error: null }

  let re
  try {
    re = new RegExp(regexStr, 'g')
  } catch (e) {
    return { segments: [], count: 0, error: e.message }
  }

  const segments = []
  let lastIndex = 0
  let count = 0
  let match

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isMatch: false })
    }
    segments.push({ text: match[0], isMatch: true })
    count++
    lastIndex = re.lastIndex
    // Prevent infinite loop on zero-length matches (e.g. \b, ^)
    if (match[0].length === 0) re.lastIndex++
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMatch: false })
  }

  return { segments, count, error: null }
}

export default function TestPanel({ regex }) {
  const [input, setInput] = useState('')

  const { segments, count, error } = useMemo(
    () => getMatches(input, regex),
    [input, regex]
  )

  const hasInput = input.length > 0
  const hasRegex = regex.length > 0

  return (
    <div className="test-panel">
      <h2 className="panel-title">Test</h2>
      <textarea
        className="test-input"
        placeholder="Paste sample text here…"
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
        spellCheck={false}
      />

      {hasInput && hasRegex && (
        <div className="test-results">
          <div className="test-meta">
            {error
              ? <span className="test-error">Invalid regex</span>
              : <span className="test-count">{count} match{count !== 1 ? 'es' : ''}</span>
            }
          </div>
          {!error && (
            <div className="test-highlighted">
              {segments.map((seg, i) =>
                seg.isMatch
                  ? <mark key={i} className="test-mark">{seg.text}</mark>
                  : <span key={i}>{seg.text}</span>
              )}
            </div>
          )}
        </div>
      )}

      {hasInput && !hasRegex && (
        <p className="test-hint">Enable sections in the builder to start matching.</p>
      )}
    </div>
  )
}
