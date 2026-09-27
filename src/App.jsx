import { useState } from 'react'
import { ClassicGame } from './ClassicGame.jsx'
import { RogueGame } from './RogueGame.jsx'
import { Taskbar } from './ui/Win.jsx'

const SETTINGS_KEY = 'bm95-settings'
function loadSettings() {
  try {
    return { marks: true, zoom: 1.5, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) }
  } catch {
    return { marks: true, zoom: 1.5 }
  }
}

export default function App() {
  const [mode, setMode] = useState('classic')
  const [settings, setSettingsState] = useState(loadSettings)

  const setSettings = (s) => {
    setSettingsState(s)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    } catch {
      /* sin almacenamiento */
    }
  }

  const zoomMenu = {
    label: 'Ver',
    items: [1, 1.5, 2, 3].map((z) => ({
      label: `Zoom ${Math.round(z * 100)}%`,
      checked: settings.zoom === z,
      onClick: () => setSettings({ ...settings, zoom: z }),
    })),
  }

  const common = { settings, onSettings: setSettings, zoomMenu }

  return (
    <div className="desktop">
      <div className="zoomed" style={{ zoom: settings.zoom }}>
        {mode === 'classic' ? (
          <ClassicGame {...common} onRogue={() => setMode('rogue')} />
        ) : (
          <RogueGame {...common} onClassic={() => setMode('classic')} />
        )}
      </div>
      <Taskbar title={mode === 'classic' ? 'Buscaminas' : 'Buscaminas - Rogue'} mode={mode === 'classic' ? 'Clásico' : 'Rogue'} />
    </div>
  )
}
