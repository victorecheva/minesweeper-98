// Definiciones del modo Rogue: pisos, objetos y reliquias.

export const FINAL_FLOOR = 10
export const START_HP = 3
export const START_GOLD = 20

const FLOOR_NAMES = [
  'La entrada',
  'Galería húmeda',
  'Túnel abandonado',
  'Nido de minas',
  'Pozo negro',
  'Sala de dinamita',
  'Corredor sin luz',
  'Cámara sellada',
  'Antesala',
  'La Bóveda',
]

export function floorConfig(n) {
  const w = Math.min(24, 8 + n)
  const h = Math.min(16, 8 + Math.floor(n / 2))
  const density = Math.min(0.22, 0.11 + n * 0.011)
  const mines = Math.round(w * h * density)
  return { w, h, mines, name: FLOOR_NAMES[n - 1] || `Piso ${n}` }
}

export function floorReward(n, purse) {
  return Math.round((15 + 5 * n) * (purse ? 1.5 : 1))
}

export const ITEMS = {
  radar: {
    name: 'Radar',
    price: 12,
    desc: 'Descubre una casilla segura al azar.',
  },
  dog: {
    name: 'Perro',
    price: 14,
    desc: 'Olfatea una zona 3x3 y marca todas sus minas.',
  },
  shield: {
    name: 'Escudo',
    price: 15,
    desc: 'Absorbe la próxima explosión. Se usa solo.',
  },
  defuser: {
    name: 'Alicates',
    price: 18,
    desc: 'Actívalos y haz clic: si hay mina, la desactivas.',
  },
  potion: {
    name: 'Botiquín',
    price: 22,
    desc: 'Recupera 1 vida.',
  },
}

export const RELICS = {
  amulet: { name: 'Amuleto', desc: '+1 vida máxima y te cura 1 vida.' },
  compass: { name: 'Brújula', desc: 'El primer clic de cada piso abre siempre un hueco.' },
  purse: { name: 'Bolsa de cuero', desc: 'Ganas un 50% más de oro al despejar pisos.' },
  detector: { name: 'Detector', desc: 'Al empezar cada piso, 2 minas aparecen marcadas.' },
  helmet: { name: 'Casco', desc: 'La primera explosión de cada piso no te quita vida.' },
  clover: { name: 'Trébol', desc: 'Recibes un Radar al empezar cada piso.' },
}

export function itemPrice(key, floor) {
  return ITEMS[key].price + floor * 3
}

export const REST_PRICE = 25
