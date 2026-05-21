import { useState, useMemo } from 'react'
import { DEFAULT_CONFIG, buildRegex, getBreakdown } from './regexEngine'
import BuilderForm from './components/BuilderForm'
import RegexPreview from './components/RegexPreview'
import RegexBreakdown from './components/RegexBreakdown'
import TestPanel from './components/TestPanel'
import ReferencePanel from './components/ReferencePanel'
import './App.css'

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  const regex = useMemo(() => buildRegex(config), [config])
  const breakdown = useMemo(() => getBreakdown(config), [config])

  function updateSection(section, changes) {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...changes },
    }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Regex Builder</h1>
        <p>Build regular expressions from plain descriptions</p>
      </header>
      <main className="app-layout">
        <section className="panel panel-left">
          <BuilderForm config={config} onChange={updateSection} />
        </section>
        <section className="panel panel-right">
          <RegexPreview regex={regex} />
          <RegexBreakdown breakdown={breakdown} />
          <TestPanel regex={regex} />
        </section>
      </main>
      <div className="reference-wrapper">
        <ReferencePanel />
      </div>
    </div>
  )
}
