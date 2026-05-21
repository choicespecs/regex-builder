import { useState, useMemo } from 'react'
import './TestPanel.css'

const MODES = [
  { id: 'match',   label: 'Match' },
  { id: 'extract', label: 'Extract' },
  { id: 'replace', label: 'Replace' },
  { id: 'split',   label: 'Split' },
]

function makeRegex(regexStr, flags = 'g') {
  try {
    return { re: new RegExp(regexStr, flags), error: null }
  } catch (e) {
    return { re: null, error: e.message }
  }
}

// ── Match ─────────────────────────────────────────────────────────────────────

function MatchOutput({ text, regexStr }) {
  const { segments, count, error } = useMemo(() => {
    const { re, error } = makeRegex(regexStr)
    if (error) return { segments: [], count: 0, error }

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
      if (match[0].length === 0) re.lastIndex++
    }
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), isMatch: false })
    }
    return { segments, count, error: null }
  }, [text, regexStr])

  if (error) return <p className="test-error">Invalid regex: {error}</p>

  return (
    <>
      <div className="test-meta">
        <span className={`test-count${count === 0 ? ' test-count--zero' : ''}`}>
          {count} match{count !== 1 ? 'es' : ''}
        </span>
      </div>
      <div className="test-highlighted">
        {segments.map((seg, i) =>
          seg.isMatch
            ? <mark key={i} className="test-mark">{seg.text}</mark>
            : <span key={i}>{seg.text}</span>
        )}
      </div>
    </>
  )
}

// ── Extract ───────────────────────────────────────────────────────────────────

function ExtractOutput({ text, regexStr }) {
  const { matches, error } = useMemo(() => {
    const { re, error } = makeRegex(regexStr)
    if (error) return { matches: [], error }
    try {
      return { matches: [...text.matchAll(re)], error: null }
    } catch (e) {
      return { matches: [], error: e.message }
    }
  }, [text, regexStr])

  if (error) return <p className="test-error">Invalid regex: {error}</p>

  return (
    <>
      <div className="test-meta">
        <span className={`test-count${matches.length === 0 ? ' test-count--zero' : ''}`}>
          {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </span>
      </div>
      <div className="extract-list">
        {matches.length === 0 && (
          <p className="test-hint">No matches. Try adjusting the pattern or the test text.</p>
        )}
        {matches.map((m, i) => {
          const groupCount = m.length - 1
          return (
            <div key={i} className="extract-item">
              <div className="extract-item-header">
                <span className="extract-num">#{i + 1}</span>
                <code className="extract-full">{m[0] || '(empty)'}</code>
                <span className="extract-pos">index {m.index}</span>
              </div>
              {groupCount > 0 && (
                <div className="extract-groups">
                  {Array.from({ length: groupCount }, (_, j) => {
                    const num = j + 1
                    const val = m[num]
                    const name = m.groups
                      ? Object.keys(m.groups).find(k => m.groups[k] === val) ?? null
                      : null
                    return (
                      <div key={num} className="extract-group">
                        <span className="extract-group-label">
                          {name ? `$<${name}>` : `$${num}`}
                        </span>
                        <code className="extract-group-value">
                          {val !== undefined ? val : 'undefined'}
                        </code>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Replace ───────────────────────────────────────────────────────────────────

function ReplaceOutput({ text, regexStr, replacement }) {
  const { result, count, error } = useMemo(() => {
    try {
      const reCount = new RegExp(regexStr, 'g')
      const count = [...text.matchAll(reCount)].length
      const re = new RegExp(regexStr, 'g')
      const result = text.replace(re, replacement)
      return { result, count, error: null }
    } catch (e) {
      return { result: null, count: 0, error: e.message }
    }
  }, [text, regexStr, replacement])

  if (error) return <p className="test-error">Invalid regex: {error}</p>

  return (
    <>
      <div className="test-meta">
        <span className={`test-count${count === 0 ? ' test-count--zero' : ''}`}>
          {count} replacement{count !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="replace-panels">
        <div className="replace-panel">
          <span className="replace-label">Before</span>
          <pre className="replace-text">{text}</pre>
        </div>
        <div className="replace-panel">
          <span className="replace-label replace-label--after">After</span>
          <pre className="replace-text">{result}</pre>
        </div>
      </div>
    </>
  )
}

// ── Split ─────────────────────────────────────────────────────────────────────

function SplitOutput({ text, regexStr }) {
  const { parts, error } = useMemo(() => {
    try {
      const re = new RegExp(regexStr)
      return { parts: text.split(re), error: null }
    } catch (e) {
      return { parts: [], error: e.message }
    }
  }, [text, regexStr])

  if (error) return <p className="test-error">Invalid regex: {error}</p>

  return (
    <>
      <div className="test-meta">
        <span className={`test-count${parts.length <= 1 ? ' test-count--zero' : ''}`}>
          {parts.length} part{parts.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="split-list">
        {parts.map((part, i) => (
          <div key={i} className="split-item">
            <span className="split-num">[{i}]</span>
            <code className="split-value">{part === '' ? '(empty)' : part}</code>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TestPanel({ regex }) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('match')
  const [replacement, setReplacement] = useState('')

  const hasInput = input.length > 0
  const hasRegex = regex.length > 0

  return (
    <div className="test-panel">
      <div className="test-panel-header">
        <h2 className="panel-title">Test</h2>
        <div className="mode-tabs">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`mode-tab${mode === m.id ? ' mode-tab--active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="test-input"
        placeholder="Paste sample text here…"
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
        spellCheck={false}
      />

      {mode === 'replace' && (
        <div className="replace-controls">
          <span className="op-label">Replacement string</span>
          <input
            type="text"
            className="test-replacement"
            placeholder='e.g.  [$1]  or  REDACTED  or  $<name>'
            value={replacement}
            onChange={e => setReplacement(e.target.value)}
          />
          <p className="op-hint">
            <code>$1</code>&thinsp;<code>$2</code> — numbered groups &nbsp;·&nbsp;
            <code>$&lt;name&gt;</code> — named group &nbsp;·&nbsp;
            <code>$&amp;</code> — full match &nbsp;·&nbsp;
            <code>$`</code> — text before &nbsp;·&nbsp;
            <code>$'</code> — text after
          </p>
        </div>
      )}

      {hasInput && hasRegex && (
        <div className="test-results">
          {mode === 'match'   && <MatchOutput   text={input} regexStr={regex} />}
          {mode === 'extract' && <ExtractOutput text={input} regexStr={regex} />}
          {mode === 'replace' && <ReplaceOutput text={input} regexStr={regex} replacement={replacement} />}
          {mode === 'split'   && <SplitOutput   text={input} regexStr={regex} />}
        </div>
      )}

      {hasInput && !hasRegex && (
        <p className="test-hint">Enable sections in the builder to start matching.</p>
      )}
    </div>
  )
}
