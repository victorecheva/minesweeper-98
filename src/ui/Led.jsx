// Contador de 7 segmentos rojo sobre negro, como el del Buscaminas de Windows.

const SEGS = {
  0: [1, 1, 1, 1, 1, 1, 0],
  1: [0, 1, 1, 0, 0, 0, 0],
  2: [1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 1, 0, 0, 1],
  4: [0, 1, 1, 0, 0, 1, 1],
  5: [1, 0, 1, 1, 0, 1, 1],
  6: [1, 0, 1, 1, 1, 1, 1],
  7: [1, 1, 1, 0, 0, 0, 0],
  8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1],
  '-': [0, 0, 0, 0, 0, 0, 1],
  ' ': [0, 0, 0, 0, 0, 0, 0],
}

const SHAPES = [
  '2,1 11,1 9,3 4,3', // a
  '12,2 12,11 10,10 10,4', // b
  '12,12 12,21 10,19 10,13', // c
  '2,22 11,22 9,20 4,20', // d
  '1,12 1,21 3,19 3,13', // e
  '1,2 1,11 3,10 3,4', // f
  '2,11.5 4,10.5 9,10.5 11,11.5 9,12.5 4,12.5', // g
]

function Digit({ ch }) {
  const on = SEGS[ch] || SEGS[' ']
  return (
    <svg width="13" height="23" viewBox="0 0 13 23" shapeRendering="crispEdges">
      <rect width="13" height="23" fill="#000" />
      {SHAPES.map((pts, i) => (
        <polygon key={i} points={pts} fill={on[i] ? '#f00' : '#3a0000'} />
      ))}
    </svg>
  )
}

export function Led({ value }) {
  let v = Math.max(-99, Math.min(999, Math.trunc(value)))
  let text = v < 0 ? '-' + String(-v).padStart(2, '0') : String(v).padStart(3, '0')
  return (
    <div className="led">
      {text.split('').map((ch, i) => (
        <Digit key={i} ch={ch} />
      ))}
    </div>
  )
}
