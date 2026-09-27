import { useEffect, useRef, useState } from 'react'

// Ventana estilo Windows 95 con barra de título y menú.
export function Window({ title, menus, children, icon, className = '' }) {
  return (
    <div className={`window ${className}`}>
      <div className="titlebar">
        {icon && <span className="title-icon">{icon}</span>}
        <span className="title">{title}</span>
        <span className="tbtn" title="Minimizar">
          <span className="glyph-min" />
        </span>
        <span className="tbtn" title="Maximizar">
          <span className="glyph-max" />
        </span>
        <span className="tbtn tbtn-close" title="Cerrar">
          ×
        </span>
      </div>
      {menus && <MenuBar menus={menus} />}
      {children}
    </div>
  )
}

// menus: [{ label, items: [{ label, shortcut, checked, disabled, onClick } | 'sep'] }]
export function MenuBar({ menus }) {
  const [open, setOpen] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (open === null) return
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(null)
    }
    const esc = (e) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="menubar" ref={ref}>
      {menus.map((m, mi) => (
        <div key={m.label} className={`menu ${open === mi ? 'open' : ''}`}>
          <span
            className="label"
            onMouseDown={(e) => {
              e.preventDefault()
              setOpen(open === mi ? null : mi)
            }}
            onMouseEnter={() => open !== null && setOpen(mi)}
          >
            <u>{m.label[0]}</u>
            {m.label.slice(1)}
          </span>
          {open === mi && (
            <div className="dropdown">
              {m.items.map((it, i) =>
                it === 'sep' ? (
                  <div key={i} className="sep" />
                ) : (
                  <div
                    key={i}
                    className={`item ${it.disabled ? 'disabled' : ''}`}
                    onClick={() => {
                      if (it.disabled) return
                      setOpen(null)
                      it.onClick && it.onClick()
                    }}
                  >
                    <span className="check">{it.checked ? '✓' : ''}</span>
                    <span className="item-label">{it.label}</span>
                    {it.shortcut && <span className="shortcut">{it.shortcut}</span>}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function Button({ children, onClick, disabled, primary, className = '', style, title, type = 'button', autoFocus }) {
  return (
    <button
      type={type}
      className={`btn ${primary ? 'primary' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title}
      autoFocus={autoFocus}
    >
      {children}
    </button>
  )
}

// Diálogo modal centrado sobre el escritorio.
export function Dialog({ title, children, onClose, width }) {
  useEffect(() => {
    if (!onClose) return
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="modal-backdrop">
      <div className="window dialog" style={{ width }}>
        <div className="titlebar">
          <span className="title">{title}</span>
          {onClose && (
            <span className="tbtn tbtn-close" onClick={onClose}>
              ×
            </span>
          )}
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  )
}

export function Taskbar({ title, mode }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(id)
  }, [])
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return (
    <div className="taskbar">
      <button className="btn start">
        <span className="start-logo" />
        Inicio
      </button>
      <div className="task active">
        <span className="task-icon" />
        {title}
      </div>
      <div className="tray">
        <span>{mode}</span>
        <span className="clock">
          {hh}:{mm}
        </span>
      </div>
    </div>
  )
}
