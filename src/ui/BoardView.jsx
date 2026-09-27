import { useEffect, useRef, useState } from 'react'
import { Flag, Mine, WrongMine } from './Icons.jsx'
import { Face } from './Icons.jsx'
import { Led } from './Led.jsx'

const NUM_COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080']

// Panel superior: contador de minas, carita y cronómetro.
export function StatusPanel({ minesLeft, time, face, onFace }) {
  return (
    <div className="panel">
      <Led value={minesLeft} />
      <button className="smiley" onClick={onFace} title="Nueva partida">
        <Face state={face} />
      </button>
      <Led value={time} />
    </div>
  )
}

function CellView({ cell, i, lost, pressed, targetMode }) {
  if (cell.revealed) {
    if (cell.mine) {
      return (
        <div className={`cell open ${cell.exploded ? 'boom' : ''}`}>
          <Mine />
        </div>
      )
    }
    if (cell.defused) {
      return (
        <div className="cell open defused" title="Mina desactivada">
          <Mine color="#3a7d2c" />
        </div>
      )
    }
    return (
      <div className={`cell open ${cell.treasure ? 'treasure' : ''}`}>
        {cell.adj > 0 && (
          <span className="num" style={{ color: NUM_COLORS[cell.adj] }}>
            {cell.adj}
          </span>
        )}
      </div>
    )
  }
  // Casilla cubierta
  if (lost && cell.mine && cell.flag !== 1) {
    return (
      <div className="cell open">
        <Mine />
      </div>
    )
  }
  if (lost && !cell.mine && cell.flag === 1) {
    return (
      <div className="cell open">
        <WrongMine />
      </div>
    )
  }
  if (cell.flag === 1) {
    return (
      <div className="cell covered" data-i={i}>
        <Flag />
      </div>
    )
  }
  return (
    <div className={`cell ${pressed ? 'open pressed' : 'covered'} ${targetMode ? 'target' : ''}`} data-i={i}>
      {cell.flag === 2 && <span className="q">?</span>}
    </div>
  )
}

export function BoardView({ board, active, lost, onReveal, onFlag, onChord, onPressing, targetMode }) {
  const [pressed, setPressed] = useState(-1)
  const skipClick = useRef(false)

  useEffect(() => {
    const up = () => {
      setPressed(-1)
      onPressing && onPressing(false)
    }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [onPressing])

  const cellIndex = (e) => {
    const el = e.target.closest('.cell')
    if (!el) return -1
    return Array.from(el.parentNode.children).indexOf(el)
  }

  const onMouseDown = (e) => {
    if (!active) return
    const i = cellIndex(e)
    if (i < 0) return
    const c = board.cells[i]
    if (e.buttons === 3 || e.button === 1) {
      e.preventDefault()
      skipClick.current = true
      onChord(i)
      return
    }
    if (e.button === 2) {
      e.preventDefault()
      if (!c.revealed) onFlag(i)
      return
    }
    if (e.button === 0) {
      onPressing && onPressing(true)
      if (!c.revealed && c.flag !== 1) setPressed(i)
    }
  }

  const onClick = (e) => {
    if (!active) return
    if (skipClick.current) {
      skipClick.current = false
      return
    }
    const i = cellIndex(e)
    if (i < 0) return
    const c = board.cells[i]
    if (c.revealed) onChord(i)
    else if (c.flag !== 1) onReveal(i)
  }

  return (
    <div
      className={`board ${targetMode ? 'targeting' : ''}`}
      style={{ gridTemplateColumns: `repeat(${board.w}, 16px)` }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      onAuxClick={(e) => e.preventDefault()}
    >
      {board.cells.map((c, i) => (
        <CellView key={i} cell={c} i={i} lost={lost} pressed={pressed === i} targetMode={targetMode} />
      ))}
    </div>
  )
}
