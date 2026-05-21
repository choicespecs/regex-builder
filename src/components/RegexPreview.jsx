import { useState } from 'react'
import './RegexPreview.css'

export default function RegexPreview({ regex }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(regex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const isEmpty = !regex

  return (
    <div className="preview">
      <h2 className="panel-title">Generated Regex</h2>
      <div className={`preview-box${isEmpty ? ' preview-box--empty' : ''}`}>
        <code className="preview-regex">
          {isEmpty ? 'Enable sections to build a pattern…' : `/${regex}/g`}
        </code>
        {!isEmpty && (
          <button
            className={`copy-btn${copied ? ' copy-btn--done' : ''}`}
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}
