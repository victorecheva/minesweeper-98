// Lógica pura del tablero. Todas las funciones devuelven tableros nuevos (inmutables).

const DIRS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
]

export function makeCell() {
  return {
    mine: false,
    revealed: false,
    flag: 0, // 0 nada, 1 bandera, 2 interrogación
    adj: 0,
    exploded: false,
    defused: false,
    treasure: 0,
  }
}

export function createBoard(w, h, mines) {
  return {
    w,
    h,
    mines,
    placed: false,
    cells: Array.from({ length: w * h }, makeCell),
  }
}

export function neighborsOf(w, h, i) {
  const x = i % w
  const y = (i / w) | 0
  const out = []
  for (const [dx, dy] of DIRS) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < w && ny < h) out.push(ny * w + nx)
  }
  return out
}

export function recalc(board) {
  const { w, h, cells } = board
  const next = cells.map((c, i) => ({
    ...c,
    adj: neighborsOf(w, h, i).reduce((n, k) => n + (cells[k].mine ? 1 : 0), 0),
  }))
  return { ...board, cells: next }
}

// Coloca las minas evitando la casilla del primer clic (y opcionalmente su entorno).
export function placeMines(board, safeIdx, rng = Math.random, opts = {}) {
  const { w, h, mines } = board
  const forbidden = new Set([safeIdx])
  if (opts.safeZero) neighborsOf(w, h, safeIdx).forEach((n) => forbidden.add(n))

  let candidates = []
  for (let i = 0; i < w * h; i++) if (!forbidden.has(i)) candidates.push(i)
  // Si no caben las minas con la zona segura ampliada, reducimos la zona.
  if (candidates.length < mines) {
    candidates = []
    for (let i = 0; i < w * h; i++) if (i !== safeIdx) candidates.push(i)
  }

  const cells = board.cells.map((c) => ({ ...c, mine: false, treasure: 0 }))
  const n = Math.min(mines, candidates.length)
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (candidates.length - i))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
    cells[candidates[i]].mine = true
  }

  if (opts.treasureRate) {
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i].mine && i !== safeIdx && rng() < opts.treasureRate) {
        cells[i].treasure = opts.treasureValue(rng)
      }
    }
  }

  return recalc({ ...board, cells, placed: true, mines: n })
}

// Descubre una casilla (con inundación si es un cero).
export function reveal(board, i) {
  const c = board.cells[i]
  if (c.revealed || c.flag === 1) return { board, hit: false, opened: [] }
  const cells = board.cells.slice()
  if (c.mine) {
    cells[i] = { ...c, revealed: true, exploded: true, flag: 0 }
    return { board: { ...board, cells }, hit: true, opened: [i] }
  }
  const opened = []
  const stack = [i]
  while (stack.length) {
    const k = stack.pop()
    const ck = cells[k]
    if (ck.revealed || ck.flag === 1 || ck.mine) continue
    cells[k] = { ...ck, revealed: true, flag: 0 }
    opened.push(k)
    if (ck.adj === 0) {
      for (const n of neighborsOf(board.w, board.h, k)) {
        if (!cells[n].revealed) stack.push(n)
      }
    }
  }
  return { board: { ...board, cells }, hit: false, opened }
}

// Abre todos los vecinos no marcados si el número de banderas coincide.
export function chord(board, i) {
  const c = board.cells[i]
  if (!c.revealed || c.adj === 0) return { board, hits: [], opened: [] }
  const ns = neighborsOf(board.w, board.h, i)
  const flags = ns.filter((n) => board.cells[n].flag === 1 || (board.cells[n].revealed && board.cells[n].mine)).length
  if (flags !== c.adj) return { board, hits: [], opened: [] }
  let b = board
  const hits = []
  let opened = []
  for (const n of ns) {
    const cn = b.cells[n]
    if (cn.revealed || cn.flag === 1) continue
    const r = reveal(b, n)
    b = r.board
    if (r.hit) hits.push(n)
    opened = opened.concat(r.opened)
  }
  return { board: b, hits, opened }
}

export function toggleFlag(board, i, marks = true) {
  const c = board.cells[i]
  if (c.revealed) return board
  const cells = board.cells.slice()
  const next = c.flag === 0 ? 1 : c.flag === 1 ? (marks ? 2 : 0) : 0
  cells[i] = { ...c, flag: next }
  return { ...board, cells }
}

export function setFlag(board, i, flag) {
  const c = board.cells[i]
  if (c.revealed || c.flag === flag) return board
  const cells = board.cells.slice()
  cells[i] = { ...c, flag }
  return { ...board, cells }
}

// Convierte una mina en casilla segura ya descubierta.
export function defuse(board, i) {
  const cells = board.cells.slice()
  cells[i] = { ...cells[i], mine: false, defused: true, revealed: true, flag: 0 }
  return recalc({ ...board, cells, mines: board.mines - 1 })
}

export function revealAll(board) {
  return {
    ...board,
    cells: board.cells.map((c) => (c.mine && c.flag !== 1 ? { ...c, revealed: true } : c)),
  }
}

export function isWon(board) {
  return board.placed && board.cells.every((c) => c.mine || c.revealed)
}

export function flagCount(board) {
  return board.cells.reduce((n, c) => n + (c.flag === 1 ? 1 : 0), 0)
}

export function explodedCount(board) {
  return board.cells.reduce((n, c) => n + (c.exploded ? 1 : 0), 0)
}

export function minesLeft(board) {
  return board.mines - flagCount(board) - explodedCount(board)
}
