// Generador pseudoaleatorio con semilla (mulberry32) para partidas reproducibles.
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Convierte un texto cualquiera en un entero de 32 bits.
export function hashSeed(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function randomSeedText() {
  const words = ['MINA', 'FLAG', 'BOOM', 'TNT', 'ROCA', 'PICO', 'ORO', 'GAS', 'LUZ', 'CAVA']
  const w = words[Math.floor(Math.random() * words.length)]
  return `${w}-${Math.floor(Math.random() * 9000 + 1000)}`
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

export function shuffle(rng, arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
