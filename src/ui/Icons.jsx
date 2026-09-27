// Iconos dibujados a mano en SVG imitando los sprites de 16x16 del Buscaminas clásico.

export function Mine({ color = '#000', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <rect x="7" y="1" width="2" height="14" fill={color} />
      <rect x="1" y="7" width="14" height="2" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="2" height="2" fill={color} />
      <rect x="4" y="3" width="8" height="10" fill={color} />
      <rect x="3" y="4" width="10" height="8" fill={color} />
      <rect x="5" y="5" width="2" height="2" fill="#fff" />
    </svg>
  )
}

export function WrongMine() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges">
      <g opacity="0.9">
        <rect x="7" y="1" width="2" height="14" fill="#000" />
        <rect x="1" y="7" width="14" height="2" fill="#000" />
        <rect x="4" y="3" width="8" height="10" fill="#000" />
        <rect x="3" y="4" width="10" height="8" fill="#000" />
        <rect x="5" y="5" width="2" height="2" fill="#fff" />
      </g>
      <path d="M1 1 L15 15 M15 1 L1 15" stroke="#f00" strokeWidth="2" />
    </svg>
  )
}

export function Flag() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges">
      <rect x="8" y="2" width="2" height="9" fill="#000" />
      <rect x="4" y="11" width="9" height="1" fill="#000" />
      <rect x="3" y="12" width="11" height="2" fill="#000" />
      <rect x="4" y="2" width="5" height="1" fill="#f00" />
      <rect x="3" y="3" width="6" height="3" fill="#f00" />
      <rect x="4" y="6" width="5" height="1" fill="#f00" />
    </svg>
  )
}

export function Face({ state = 'normal' }) {
  // state: normal | oh | dead | cool
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" shapeRendering="crispEdges">
      <circle cx="8.5" cy="8.5" r="7.5" fill="#ff0" stroke="#000" strokeWidth="1" />
      {state === 'dead' ? (
        <>
          <path d="M4 4 L7 7 M7 4 L4 7 M10 4 L13 7 M13 4 L10 7" stroke="#000" strokeWidth="1" />
          <path d="M5 13 Q8.5 9 12 13" fill="none" stroke="#000" strokeWidth="1" />
        </>
      ) : state === 'cool' ? (
        <>
          <rect x="3" y="5" width="5" height="3" fill="#000" />
          <rect x="9" y="5" width="5" height="3" fill="#000" />
          <rect x="8" y="5" width="1" height="1" fill="#000" />
          <rect x="2" y="5" width="13" height="1" fill="#000" />
          <path d="M5 11 Q8.5 15 12 11" fill="none" stroke="#000" strokeWidth="1" />
        </>
      ) : state === 'oh' ? (
        <>
          <rect x="5" y="5" width="2" height="2" fill="#000" />
          <rect x="10" y="5" width="2" height="2" fill="#000" />
          <circle cx="8.5" cy="11.5" r="2" fill="none" stroke="#000" strokeWidth="1" />
        </>
      ) : (
        <>
          <rect x="5" y="5" width="2" height="2" fill="#000" />
          <rect x="10" y="5" width="2" height="2" fill="#000" />
          <path d="M5 10 Q8.5 14 12 10" fill="none" stroke="#000" strokeWidth="1" />
        </>
      )}
    </svg>
  )
}

export function Heart({ full = true, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <path
        d="M2 3 h3 v1 h1 v1 h1 v1 h2 v-1 h1 v-1 h1 v-1 h3 v1 h1 v4 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-2 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-4 h1 z"
        fill={full ? '#e00' : '#808080'}
        stroke="#000"
        strokeWidth="1"
      />
      {full && <rect x="3" y="4" width="2" height="1" fill="#f88" />}
    </svg>
  )
}

export function Coin({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <circle cx="8" cy="8" r="6.5" fill="#ffd700" stroke="#7a5b00" strokeWidth="1" />
      <circle cx="8" cy="8" r="4" fill="none" stroke="#b8860b" strokeWidth="1" />
      <rect x="7" y="5" width="2" height="6" fill="#7a5b00" />
    </svg>
  )
}

export function Skull({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <rect x="4" y="2" width="8" height="8" fill="#fff" stroke="#000" strokeWidth="1" />
      <rect x="5" y="10" width="6" height="3" fill="#fff" stroke="#000" strokeWidth="1" />
      <rect x="5" y="4" width="2" height="2" fill="#000" />
      <rect x="9" y="4" width="2" height="2" fill="#000" />
      <rect x="7" y="7" width="2" height="1" fill="#000" />
      <rect x="6" y="11" width="1" height="2" fill="#000" />
      <rect x="9" y="11" width="1" height="2" fill="#000" />
    </svg>
  )
}

export function ItemIcon({ kind, size = 16 }) {
  const common = { width: size, height: size, viewBox: '0 0 16 16', shapeRendering: 'crispEdges' }
  switch (kind) {
    case 'radar':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.5" fill="#004" stroke="#000" />
          <circle cx="8" cy="8" r="4" fill="none" stroke="#0f0" />
          <circle cx="8" cy="8" r="1.5" fill="#0f0" />
          <path d="M8 8 L13 3" stroke="#0f0" strokeWidth="1.5" />
          <rect x="10" y="9" width="2" height="2" fill="#0f0" />
        </svg>
      )
    case 'dog':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="9" height="6" fill="#b5651d" stroke="#000" />
          <rect x="10" y="4" width="5" height="5" fill="#b5651d" stroke="#000" />
          <rect x="9" y="3" width="2" height="3" fill="#8b4513" />
          <rect x="4" y="12" width="2" height="3" fill="#8b4513" />
          <rect x="9" y="12" width="2" height="3" fill="#8b4513" />
          <rect x="1" y="5" width="2" height="3" fill="#8b4513" />
          <rect x="13" y="6" width="1" height="1" fill="#000" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M8 1 L14 3 V8 Q14 13 8 15 Q2 13 2 8 V3 Z" fill="#1e5bd6" stroke="#000" />
          <path d="M8 3 L12 4.5 V8 Q12 11.5 8 13 Z" fill="#7fb0ff" />
        </svg>
      )
    case 'defuser':
      return (
        <svg {...common}>
          <path d="M3 2 L8 8 M13 2 L8 8" stroke="#c00" strokeWidth="2.5" />
          <path d="M8 8 L4 14 M8 8 L12 14" stroke="#555" strokeWidth="2" />
          <circle cx="8" cy="8" r="1.5" fill="#000" />
        </svg>
      )
    case 'potion':
      return (
        <svg {...common}>
          <rect x="1" y="4" width="14" height="10" fill="#fff" stroke="#000" />
          <rect x="5" y="2" width="6" height="2" fill="#808080" stroke="#000" />
          <rect x="7" y="6" width="2" height="6" fill="#e00" />
          <rect x="5" y="8" width="6" height="2" fill="#e00" />
        </svg>
      )
    default:
      return null
  }
}

export function RelicIcon({ kind, size = 24 }) {
  const common = { width: size, height: size, viewBox: '0 0 16 16', shapeRendering: 'crispEdges' }
  switch (kind) {
    case 'amulet':
      return (
        <svg {...common}>
          <path d="M3 2 Q8 10 13 2" fill="none" stroke="#b8860b" />
          <path d="M8 6 L11 9 L8 14 L5 9 Z" fill="#e0115f" stroke="#000" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.5" fill="#f5deb3" stroke="#000" />
          <path d="M8 2 L10 8 L8 14 L6 8 Z" fill="#c00" />
          <path d="M8 8 L10 8 L8 14 L6 8 Z" fill="#fff" stroke="#000" strokeWidth="0.5" />
        </svg>
      )
    case 'purse':
      return (
        <svg {...common}>
          <path d="M4 6 L12 6 L14 14 L2 14 Z" fill="#8b4513" stroke="#000" />
          <path d="M6 6 Q8 1 10 6" fill="none" stroke="#000" />
          <rect x="7" y="9" width="2" height="2" fill="#ffd700" />
        </svg>
      )
    case 'detector':
      return (
        <svg {...common}>
          <rect x="2" y="10" width="12" height="4" fill="#555" stroke="#000" />
          <rect x="7" y="2" width="2" height="8" fill="#888" />
          <rect x="4" y="11" width="2" height="2" fill="#0f0" />
          <rect x="10" y="11" width="2" height="2" fill="#f00" />
        </svg>
      )
    case 'helmet':
      return (
        <svg {...common}>
          <path d="M2 10 Q2 3 8 3 Q14 3 14 10 Z" fill="#ffd700" stroke="#000" />
          <rect x="1" y="10" width="14" height="2" fill="#b8860b" stroke="#000" />
          <rect x="6" y="5" width="4" height="2" fill="#fff" />
        </svg>
      )
    case 'clover':
      return (
        <svg {...common}>
          <circle cx="5" cy="5" r="3" fill="#0a0" />
          <circle cx="11" cy="5" r="3" fill="#0a0" />
          <circle cx="5" cy="11" r="3" fill="#0a0" />
          <circle cx="11" cy="11" r="3" fill="#0a0" />
          <rect x="7" y="8" width="2" height="7" fill="#060" />
        </svg>
      )
    default:
      return null
  }
}
