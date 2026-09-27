import { useCallback, useEffect, useRef, useState } from 'react'
import { chord, createBoard, isWon, minesLeft, placeMines, reveal, revealAll, toggleFlag } from './game/board.js'
import { BoardView, StatusPanel } from './ui/BoardView.jsx'
import { Button, Dialog, Window } from './ui/Win.jsx'
import { Mine } from './ui/Icons.jsx'

export const DIFFS = {
  beginner: { w: 9, h: 9, mines: 10, label: 'Principiante' },
  intermediate: { w: 16, h: 16, mines: 40, label: 'Intermedio' },
  expert: { w: 30, h: 16, mines: 99, label: 'Experto' },
}

const BEST_KEY = 'bm95-best-times'

function loadBest() {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY)) || {}
  } catch {
    return {}
  }
}
function saveBest(b) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(b))
  } catch {
    /* sin almacenamiento */
  }
}

const DEFAULT_BEST = { beginner: { time: 999, name: 'Anónimo' }, intermediate: { time: 999, name: 'Anónimo' }, expert: { time: 999, name: 'Anónimo' } }

export function ClassicGame({ settings, onSettings, onRogue, zoomMenu }) {
  const [diffKey, setDiffKey] = useState('beginner')
  const [custom, setCustom] = useState({ w: 9, h: 9, mines: 10 })
  const cfg = diffKey === 'custom' ? custom : DIFFS[diffKey]

  const [board, setBoard] = useState(() => createBoard(cfg.w, cfg.h, cfg.mines))
  const [status, setStatus] = useState('idle') // idle | playing | won | lost
  const [time, setTime] = useState(0)
  const [pressing, setPressing] = useState(false)
  const [dialog, setDialog] = useState(null) // custom | best | record | about | help
  const [best, setBest] = useState(() => ({ ...DEFAULT_BEST, ...loadBest() }))
  const [recordName, setRecordName] = useState('Anónimo')
  const timerRef = useRef(null)

  const newGame = useCallback(
    (c = cfg) => {
      setBoard(createBoard(c.w, c.h, c.mines))
      setStatus('idle')
      setTime(0)
    },
    [cfg],
  )

  // Cronómetro
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => setTime((t) => Math.min(999, t + 1)), 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [status])

  // F2 = nueva partida
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        newGame()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [newGame])

  const finish = (b, won) => {
    if (won) {
      setBoard({ ...b, cells: b.cells.map((c) => (c.mine ? { ...c, flag: 1 } : c)) })
      setStatus('won')
      if (diffKey !== 'custom' && time < best[diffKey].time) {
        setDialog('record')
      }
    } else {
      setBoard(revealAll(b))
      setStatus('lost')
    }
  }

  const handleReveal = (i) => {
    if (status === 'won' || status === 'lost') return
    let b = board
    if (!b.placed) {
      b = placeMines(b, i)
      setStatus('playing')
    }
    const r = reveal(b, i)
    if (r.hit) return finish(r.board, false)
    setBoard(r.board)
    if (isWon(r.board)) finish(r.board, true)
  }

  const handleChord = (i) => {
    if (status !== 'playing') return
    const r = chord(board, i)
    if (r.hits.length) return finish(r.board, false)
    setBoard(r.board)
    if (isWon(r.board)) finish(r.board, true)
  }

  const handleFlag = (i) => {
    if (status === 'won' || status === 'lost') return
    setBoard((b) => toggleFlag(b, i, settings.marks))
  }

  const chooseDiff = (key) => {
    setDiffKey(key)
    const c = DIFFS[key]
    newGame(c)
  }

  const applyCustom = (c) => {
    const w = Math.max(9, Math.min(30, c.w | 0))
    const h = Math.max(9, Math.min(24, c.h | 0))
    const mines = Math.max(10, Math.min((w - 1) * (h - 1), c.mines | 0))
    setCustom({ w, h, mines })
    setDiffKey('custom')
    newGame({ w, h, mines })
    setDialog(null)
  }

  const saveRecord = () => {
    const nb = { ...best, [diffKey]: { time, name: recordName.trim() || 'Anónimo' } }
    setBest(nb)
    saveBest(nb)
    setDialog('best')
  }

  const resetBest = () => {
    setBest(DEFAULT_BEST)
    saveBest(DEFAULT_BEST)
  }

  const face = status === 'lost' ? 'dead' : status === 'won' ? 'cool' : pressing ? 'oh' : 'normal'

  const menus = [
    {
      label: 'Juego',
      items: [
        { label: 'Nuevo', shortcut: 'F2', onClick: () => newGame() },
        'sep',
        { label: 'Principiante', checked: diffKey === 'beginner', onClick: () => chooseDiff('beginner') },
        { label: 'Intermedio', checked: diffKey === 'intermediate', onClick: () => chooseDiff('intermediate') },
        { label: 'Experto', checked: diffKey === 'expert', onClick: () => chooseDiff('expert') },
        { label: 'Personalizado...', checked: diffKey === 'custom', onClick: () => setDialog('custom') },
        'sep',
        { label: 'Modo Rogue...', onClick: onRogue },
        'sep',
        { label: 'Marcas (?)', checked: settings.marks, onClick: () => onSettings({ ...settings, marks: !settings.marks }) },
        'sep',
        { label: 'Mejores tiempos...', onClick: () => setDialog('best') },
        'sep',
        { label: 'Salir', onClick: () => window.close() },
      ],
    },
    zoomMenu,
    {
      label: 'Ayuda',
      items: [
        { label: 'Cómo jugar', shortcut: 'F1', onClick: () => setDialog('help') },
        'sep',
        { label: 'Acerca de Buscaminas...', onClick: () => setDialog('about') },
      ],
    },
  ]

  return (
    <>
      <Window title="Buscaminas" icon={<Mine size={14} />} menus={menus}>
        <div className="game">
          <StatusPanel minesLeft={minesLeft(board)} time={time} face={face} onFace={() => newGame()} />
          <BoardView
            board={board}
            active={status === 'idle' || status === 'playing'}
            lost={status === 'lost'}
            onReveal={handleReveal}
            onFlag={handleFlag}
            onChord={handleChord}
            onPressing={setPressing}
          />
        </div>
      </Window>

      {dialog === 'custom' && <CustomDialog initial={custom} onOk={applyCustom} onClose={() => setDialog(null)} />}

      {dialog === 'record' && (
        <Dialog title="Buscaminas" width={260}>
          <p style={{ textAlign: 'center', margin: '6px 0' }}>
            Ha conseguido el mejor tiempo
            <br />
            en el nivel {DIFFS[diffKey].label.toLowerCase()}.
            <br />
            Escriba su nombre:
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveRecord()
            }}
          >
            <input className="input" autoFocus value={recordName} onChange={(e) => setRecordName(e.target.value)} maxLength={20} style={{ width: '100%' }} />
            <div className="dialog-buttons">
              <Button type="submit" primary>
                Aceptar
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {dialog === 'best' && (
        <Dialog title="Los mejores buscaminas" onClose={() => setDialog(null)} width={300}>
          <table className="best">
            <tbody>
              {['beginner', 'intermediate', 'expert'].map((k) => (
                <tr key={k}>
                  <td>{DIFFS[k].label}:</td>
                  <td>{best[k].time} segundos</td>
                  <td>{best[k].name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="dialog-buttons">
            <Button onClick={resetBest}>Restablecer</Button>
            <Button primary onClick={() => setDialog(null)}>
              Aceptar
            </Button>
          </div>
        </Dialog>
      )}

      {dialog === 'about' && (
        <Dialog title="Acerca de Buscaminas" onClose={() => setDialog(null)} width={340}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ marginTop: 4 }}>
              <Mine size={32} />
            </div>
            <div>
              <p style={{ margin: '0 0 6px' }}>
                <b>Buscaminas 95</b>
                <br />
                Versión 1.0 (React)
              </p>
              <p style={{ margin: '0 0 6px' }}>
                Reimplementación del clásico Buscaminas de Windows 95, con un modo Rogue de regalo.
              </p>
              <p style={{ margin: 0, color: '#404040' }}>
                Memoria física disponible para Windows: 16.384 KB
              </p>
            </div>
          </div>
          <div className="dialog-buttons">
            <Button primary onClick={() => setDialog(null)}>
              Aceptar
            </Button>
          </div>
        </Dialog>
      )}

      {dialog === 'help' && (
        <Dialog title="Ayuda de Buscaminas" onClose={() => setDialog(null)} width={380}>
          <ul className="help">
            <li>
              <b>Clic izquierdo</b>: descubre una casilla.
            </li>
            <li>
              <b>Clic derecho</b>: pone bandera, interrogación o la quita.
            </li>
            <li>
              <b>Clic en un número</b> (o botón central): descubre las casillas de alrededor si ya has puesto tantas banderas como indica el número.
            </li>
            <li>El primer clic nunca es una mina.</li>
            <li>
              <b>F2</b> o la carita: nueva partida.
            </li>
            <li>
              En el <b>Modo Rogue</b> tienes vidas, oro, objetos y reliquias. Desciende 10 pisos para escapar.
            </li>
          </ul>
          <div className="dialog-buttons">
            <Button primary onClick={() => setDialog(null)}>
              Aceptar
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}

function CustomDialog({ initial, onOk, onClose }) {
  const [v, setV] = useState(initial)
  const field = (k, label) => (
    <label className="field">
      <span>{label}:</span>
      <input className="input" type="number" value={v[k]} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} style={{ width: 60 }} />
    </label>
  )
  return (
    <Dialog title="Campo personalizado" onClose={onClose} width={260}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onOk(v)
        }}
        style={{ display: 'flex', gap: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {field('h', 'Alto')}
          {field('w', 'Ancho')}
          {field('mines', 'Minas')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button type="submit" primary>
            Aceptar
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </Dialog>
  )
}
