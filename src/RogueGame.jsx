import { useEffect, useRef, useState } from 'react'
import { chord, createBoard, defuse, isWon, minesLeft, neighborsOf, placeMines, reveal, revealAll, setFlag, toggleFlag } from './game/board.js'
import { FINAL_FLOOR, ITEMS, RELICS, REST_PRICE, START_GOLD, START_HP, floorConfig, floorReward, itemPrice } from './game/rogue.js'
import { hashSeed, mulberry32, pick, randomSeedText, shuffle } from './game/rng.js'
import { BoardView, StatusPanel } from './ui/BoardView.jsx'
import { Button, Dialog, Window } from './ui/Win.jsx'
import { Coin, Heart, ItemIcon, Mine, RelicIcon, Skull } from './ui/Icons.jsx'

const BEST_KEY = 'bm95-rogue-best'
function loadBest() {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY)) || null
  } catch {
    return null
  }
}
function saveBest(b) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(b))
  } catch {
    /* sin almacenamiento */
  }
}

const ITEM_KEYS = Object.keys(ITEMS)

function freshStats() {
  return { hits: 0, defused: 0, treasures: 0, goldEarned: 0, floorsCleared: 0, shieldsUsed: 0 }
}

function newFloor(run, n) {
  const cfg = floorConfig(n)
  const items = { ...run.items }
  if (run.relics.includes('clover')) items.radar += 1
  return {
    ...run,
    floor: n,
    board: createBoard(cfg.w, cfg.h, cfg.mines),
    floorName: cfg.name,
    items,
    helmetUsed: false,
    targetMode: false,
    msg: `Piso ${n}: ${cfg.name}. ${cfg.mines} minas.` + (run.relics.includes('clover') ? ' El trébol te da un Radar.' : ''),
  }
}

export function RogueGame({ settings, onSettings, onClassic, zoomMenu }) {
  const rngRef = useRef(Math.random)
  const [run, setRun] = useState({ phase: 'title', board: createBoard(9, 9, 10), floor: 1, hp: 3, maxHp: 3, gold: 0, items: {}, relics: [], stats: freshStats(), time: 0, msg: '' })
  const [pressing, setPressing] = useState(false)
  const [hitFlash, setHitFlash] = useState(0)
  const [dialog, setDialog] = useState(null) // help | items
  const [best, setBest] = useState(loadBest)
  const [seedInput, setSeedInput] = useState(randomSeedText)

  // Cronómetro total de la partida
  useEffect(() => {
    if (run.phase !== 'playing') return
    const id = setInterval(() => setRun((r) => ({ ...r, time: r.time + 1 })), 1000)
    return () => clearInterval(id)
  }, [run.phase])

  // Cara de muerto y temblor al recibir una explosión
  useEffect(() => {
    if (!hitFlash) return
    const id = setTimeout(() => setHitFlash(0), 450)
    return () => clearTimeout(id)
  }, [hitFlash])

  const rng = () => rngRef.current()
  const has = (r, relic) => r.relics.includes(relic)

  // ---------- Inicio ----------
  const startRun = (seedText) => {
    const text = seedText.trim() || randomSeedText()
    rngRef.current = mulberry32(hashSeed(text))
    let r = {
      phase: 'playing',
      seedText: text,
      floor: 1,
      hp: START_HP,
      maxHp: START_HP,
      gold: START_GOLD,
      items: { radar: 1, dog: 0, shield: 1, defuser: 0, potion: 0 },
      relics: [],
      stats: freshStats(),
      time: 0,
      shopOffer: [],
      relicOffer: [],
      reward: 0,
    }
    r = newFloor(r, 1)
    setRun(r)
  }

  const abandon = () => {
    setRun((r) => ({ ...r, phase: 'title' }))
    setSeedInput(randomSeedText())
  }

  // ---------- Mecánica ----------
  const ensurePlaced = (r, safeIdx) => {
    if (r.board.placed) return r
    const floor = r.floor
    let board = placeMines(r.board, safeIdx, rng, {
      safeZero: has(r, 'compass'),
      treasureRate: 0.04,
      treasureValue: (rr) => 3 + Math.floor(rr() * 5) + floor,
    })
    if (has(r, 'detector')) {
      const mines = board.cells.map((c, i) => (c.mine ? i : -1)).filter((i) => i >= 0)
      shuffle(rng, mines)
        .slice(0, 2)
        .forEach((i) => {
          board = setFlag(board, i, 1)
        })
    }
    return { ...r, board }
  }

  const applyHits = (r, n) => {
    let out = { ...r, items: { ...r.items }, stats: { ...r.stats } }
    const notes = []
    for (let k = 0; k < n; k++) {
      out.stats.hits++
      if (has(out, 'helmet') && !out.helmetUsed) {
        out.helmetUsed = true
        notes.push('¡BOOM! El casco ha aguantado el golpe.')
      } else if (out.items.shield > 0) {
        out.items.shield--
        out.stats.shieldsUsed++
        notes.push('¡BOOM! El escudo se ha hecho añicos.')
      } else {
        out.hp--
        notes.push('¡BOOM! Pierdes una vida.')
      }
    }
    setHitFlash((f) => f + 1)
    out.msg = notes[notes.length - 1]
    return out
  }

  const settle = (r, opened) => {
    let out = { ...r, stats: { ...r.stats } }
    let found = 0
    for (const i of opened) {
      const t = out.board.cells[i].treasure
      if (t) {
        found += t
        out.stats.treasures++
      }
    }
    if (found) {
      out.gold += found
      out.stats.goldEarned += found
      out.msg = `Encuentras ${found} de oro escondido.`
    }
    if (out.hp <= 0) {
      out.hp = 0
      out.phase = 'dead'
      out.board = revealAll(out.board)
      out.msg = 'Has muerto.'
      const record = { floor: out.floor, seed: out.seedText, gold: out.stats.goldEarned }
      if (!best || out.floor > best.floor) {
        setBest(record)
        saveBest(record)
      }
    } else if (isWon(out.board)) {
      const reward = floorReward(out.floor, has(out, 'purse'))
      out.gold += reward
      out.reward = reward
      out.stats.goldEarned += reward
      out.stats.floorsCleared = out.floor
      out.phase = 'cleared'
      out.targetMode = false
      out.msg = `Piso ${out.floor} despejado.`
    }
    setRun(out)
  }

  const handleReveal = (i) => {
    if (run.phase !== 'playing') return
    let r = ensurePlaced(run, i)
    if (r.targetMode) {
      r = { ...r, targetMode: false, items: { ...r.items }, stats: { ...r.stats } }
      const c = r.board.cells[i]
      if (c.mine) {
        r.board = defuse(r.board, i)
        r.items.defuser--
        r.stats.defused++
        r.msg = '¡Clac! Mina desactivada.'
        return settle(r, [])
      }
      r.msg = 'Aquí no había mina. Conservas los alicates.'
    }
    const res = reveal(r.board, i)
    r = { ...r, board: res.board }
    if (res.hit) r = applyHits(r, 1)
    settle(r, res.opened)
  }

  const handleChord = (i) => {
    if (run.phase !== 'playing' || !run.board.placed) return
    const res = chord(run.board, i)
    let r = { ...run, board: res.board }
    if (res.hits.length) r = applyHits(r, res.hits.length)
    settle(r, res.opened)
  }

  const handleFlag = (i) => {
    if (run.phase !== 'playing') return
    setRun({ ...run, board: toggleFlag(run.board, i, settings.marks) })
  }

  // ---------- Objetos ----------
  const useRadar = () => {
    if (run.phase !== 'playing' || run.items.radar < 1) return
    let r = run
    let idx
    if (!r.board.placed) {
      idx = Math.floor(rng() * r.board.cells.length)
      r = ensurePlaced(r, idx)
    } else {
      const cands = r.board.cells.map((c, i) => (!c.mine && !c.revealed && c.flag !== 1 ? i : -1)).filter((i) => i >= 0)
      if (!cands.length) return setRun({ ...r, msg: 'El radar no encuentra nada nuevo.' })
      idx = pick(rng, cands)
    }
    const res = reveal(r.board, idx)
    r = { ...r, board: res.board, items: { ...r.items, radar: r.items.radar - 1 }, targetMode: false, msg: 'Bip... bip... El radar revela una casilla segura.' }
    settle(r, res.opened)
  }

  const useDog = () => {
    if (run.phase !== 'playing' || run.items.dog < 1) return
    if (!run.board.placed) return setRun({ ...run, msg: 'El perro no huele nada todavía. Descubre alguna casilla primero.' })
    const b = run.board
    const hidden = b.cells.map((c, i) => (c.mine && !c.revealed && c.flag !== 1 ? i : -1)).filter((i) => i >= 0)
    if (!hidden.length) return setRun({ ...run, msg: 'El perro no encuentra nada que marcar.' })
    const center = pick(rng, hidden)
    let board = b
    let k = 0
    for (const n of [center, ...neighborsOf(b.w, b.h, center)]) {
      const c = board.cells[n]
      if (c.mine && !c.revealed && c.flag !== 1) {
        board = setFlag(board, n, 1)
        k++
      }
    }
    setRun({ ...run, board, items: { ...run.items, dog: run.items.dog - 1 }, targetMode: false, msg: `¡Guau! El perro ha marcado ${k} mina${k === 1 ? '' : 's'}.` })
  }

  const usePotion = () => {
    if (run.phase !== 'playing' || run.items.potion < 1 || run.hp >= run.maxHp) return
    setRun({ ...run, hp: run.hp + 1, items: { ...run.items, potion: run.items.potion - 1 }, msg: 'Te vendas las heridas. +1 vida.' })
  }

  const toggleDefuser = () => {
    if (run.phase !== 'playing' || run.items.defuser < 1) return
    const on = !run.targetMode
    setRun({ ...run, targetMode: on, msg: on ? 'Alicates listos: haz clic en la casilla que quieras desactivar.' : 'Guardas los alicates.' })
  }

  // ---------- Entre pisos ----------
  const advance = () => {
    const r = run
    if (r.floor >= FINAL_FLOOR) {
      const record = { floor: FINAL_FLOOR + 1, seed: r.seedText, gold: r.stats.goldEarned, escaped: true }
      if (!best || record.floor > best.floor) {
        setBest(record)
        saveBest(record)
      }
      return setRun({ ...r, phase: 'won' })
    }
    const available = Object.keys(RELICS).filter((k) => !r.relics.includes(k))
    if (r.floor % 3 === 0 && available.length) {
      return setRun({ ...r, phase: 'relic', relicOffer: shuffle(rng, available).slice(0, 2) })
    }
    openShop(r)
  }

  const openShop = (r) => {
    const offer = shuffle(rng, ITEM_KEYS)
      .slice(0, 3)
      .map((key) => ({ key, price: itemPrice(key, r.floor), sold: false }))
    setRun({ ...r, phase: 'shop', shopOffer: offer })
  }

  const chooseRelic = (key) => {
    let r = { ...run, relics: key ? [...run.relics, key] : run.relics }
    if (key === 'amulet') r = { ...r, maxHp: r.maxHp + 1, hp: r.hp + 1 }
    openShop(r)
  }

  const buy = (idx) => {
    const o = run.shopOffer[idx]
    if (o.sold || run.gold < o.price) return
    const offer = run.shopOffer.map((x, i) => (i === idx ? { ...x, sold: true } : x))
    setRun({ ...run, gold: run.gold - o.price, items: { ...run.items, [o.key]: (run.items[o.key] || 0) + 1 }, shopOffer: offer })
  }

  const rest = () => {
    if (run.gold < REST_PRICE || run.hp >= run.maxHp) return
    setRun({ ...run, gold: run.gold - REST_PRICE, hp: run.hp + 1 })
  }

  const descend = () => {
    setRun({ ...newFloor(run, run.floor + 1), phase: 'playing' })
  }

  // ---------- Render ----------
  const face = run.phase === 'dead' ? 'dead' : hitFlash ? 'dead' : run.phase === 'won' || run.phase === 'cleared' ? 'cool' : pressing ? 'oh' : 'normal'
  const playing = run.phase === 'playing'

  const menus = [
    {
      label: 'Juego',
      items: [
        { label: 'Nueva partida...', shortcut: 'F2', onClick: abandon },
        { label: 'Abandonar partida', disabled: run.phase === 'title', onClick: abandon },
        'sep',
        { label: 'Marcas (?)', checked: settings.marks, onClick: () => onSettings({ ...settings, marks: !settings.marks }) },
        'sep',
        { label: 'Volver al Buscaminas clásico', onClick: onClassic },
      ],
    },
    zoomMenu,
    {
      label: 'Ayuda',
      items: [
        { label: 'Cómo jugar al modo Rogue', onClick: () => setDialog('help') },
        { label: 'Objetos y reliquias', onClick: () => setDialog('items') },
      ],
    },
  ]

  useEffect(() => {
    const key = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        abandon()
      }
      if (e.key === 'Escape' && run.targetMode) toggleDefuser()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  const hearts = []
  for (let i = 0; i < run.maxHp; i++) hearts.push(<Heart key={i} full={i < run.hp} />)

  const itemButton = (key, onClick, extra = {}) => {
    const n = run.items[key] || 0
    const active = key === 'defuser' && run.targetMode
    return (
      <button
        key={key}
        className={`btn item-btn ${active ? 'active' : ''}`}
        disabled={!playing || n < 1 || extra.disabled}
        onClick={onClick}
        title={ITEMS[key].desc}
      >
        <ItemIcon kind={key} />
        <span>{ITEMS[key].name}</span>
        <span className="count">×{n}</span>
      </button>
    )
  }

  return (
    <>
      <Window title="Buscaminas - Rogue" icon={<Mine size={14} />} menus={menus} className={hitFlash ? 'shake' : ''}>
        <div className="game">
          <StatusPanel minesLeft={minesLeft(run.board)} time={run.time} face={face} onFace={abandon} />
          <div className="rogue-panel">
            <div className="rogue-row">
              <span className="floor">
                Piso <b>{run.floor}</b>/{FINAL_FLOOR} · {run.floorName || ''}
              </span>
              <span className="hearts" title={`Vidas: ${run.hp}/${run.maxHp}`}>
                {hearts}
              </span>
              <span className="gold" title="Oro">
                <Coin /> <b>{run.gold}</b>
              </span>
            </div>
            <div className="rogue-row items">
              {itemButton('radar', useRadar)}
              {itemButton('dog', useDog)}
              {itemButton('defuser', toggleDefuser)}
              {itemButton('potion', usePotion, { disabled: run.hp >= run.maxHp })}
              <span className="item-btn passive" title={ITEMS.shield.desc}>
                <ItemIcon kind="shield" />
                <span>Escudo</span>
                <span className="count">×{run.items.shield || 0}</span>
              </span>
            </div>
            {run.relics.length > 0 && (
              <div className="rogue-row relics">
                <span className="dim">Reliquias:</span>
                {run.relics.map((k) => (
                  <span key={k} className="relic" title={`${RELICS[k].name}: ${RELICS[k].desc}`}>
                    <RelicIcon kind={k} size={16} />
                  </span>
                ))}
              </div>
            )}
          </div>
          <BoardView
            board={run.board}
            active={playing}
            lost={run.phase === 'dead'}
            onReveal={handleReveal}
            onFlag={handleFlag}
            onChord={handleChord}
            onPressing={setPressing}
            targetMode={run.targetMode}
          />
        </div>
        <div className="statusbar">
          <span>{run.msg || 'Listo.'}</span>
          {run.seedText && <span className="seed">Semilla: {run.seedText}</span>}
        </div>
      </Window>

      {run.phase === 'title' && (
        <Dialog title="Modo Rogue" width={360}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ marginTop: 2 }}>
              <Skull size={32} />
            </div>
            <div>
              <p style={{ margin: '0 0 6px' }}>
                <b>Desciende {FINAL_FLOOR} pisos de un campo de minas.</b>
              </p>
              <p style={{ margin: '0 0 6px' }}>
                Tienes {START_HP} vidas. Pisar una mina te quita una, pero la partida sigue. Al despejar un piso ganas oro para comprar
                objetos en la tienda. Cada 3 pisos eliges una reliquia. Si te quedas sin vidas, la partida se acaba: no hay segunda
                oportunidad.
              </p>
              {best && (
                <p style={{ margin: '0 0 6px', color: '#404040' }}>
                  Mejor intento: {best.escaped ? '¡escapaste!' : `piso ${best.floor}`} ({best.gold} de oro, semilla {best.seed})
                </p>
              )}
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              startRun(seedInput)
            }}
          >
            <label className="field" style={{ marginTop: 6 }}>
              <span>Semilla:</span>
              <input className="input" value={seedInput} onChange={(e) => setSeedInput(e.target.value)} style={{ flex: 1 }} maxLength={24} autoFocus />
              <Button className="small" onClick={() => setSeedInput(randomSeedText())} title="Otra semilla">
                ↻
              </Button>
            </label>
            <div className="dialog-buttons">
              <Button type="submit" primary>
                Empezar
              </Button>
              <Button onClick={onClassic}>Cancelar</Button>
            </div>
          </form>
        </Dialog>
      )}

      {run.phase === 'cleared' && (
        <Dialog title="Piso despejado" width={300}>
          <p style={{ margin: '4px 0' }}>
            <b>
              Piso {run.floor}: {run.floorName}
            </b>{' '}
            despejado.
          </p>
          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            Recompensa: <Coin /> <b>{run.reward}</b> de oro{has(run, 'purse') ? ' (bolsa de cuero incluida)' : ''}.
          </p>
          <div className="dialog-buttons">
            <Button primary onClick={advance} autoFocus>
              {run.floor >= FINAL_FLOOR ? 'Salir a la superficie' : 'Continuar'}
            </Button>
          </div>
        </Dialog>
      )}

      {run.phase === 'relic' && (
        <Dialog title="Una reliquia brilla entre los escombros" width={380}>
          <p style={{ margin: '2px 0 8px' }}>Elige una. Sus efectos duran toda la partida.</p>
          <div className="offer">
            {run.relicOffer.map((k) => (
              <button key={k} className="btn card" onClick={() => chooseRelic(k)}>
                <RelicIcon kind={k} size={28} />
                <b>{RELICS[k].name}</b>
                <span>{RELICS[k].desc}</span>
              </button>
            ))}
          </div>
          <div className="dialog-buttons">
            <Button onClick={() => chooseRelic(null)}>No quiero ninguna</Button>
          </div>
        </Dialog>
      )}

      {run.phase === 'shop' && (
        <Dialog title="Tienda del minero" width={420}>
          <div className="shop-head">
            <span>
              Piso {run.floor} superado. Oro: <Coin /> <b>{run.gold}</b>
            </span>
            <span className="hearts">{hearts}</span>
          </div>
          <div className="offer">
            {run.shopOffer.map((o, i) => (
              <button key={i} className="btn card" disabled={o.sold || run.gold < o.price} onClick={() => buy(i)}>
                <ItemIcon kind={o.key} size={28} />
                <b>{ITEMS[o.key].name}</b>
                <span>{ITEMS[o.key].desc}</span>
                <span className="price">{o.sold ? 'Vendido' : `${o.price} oro`}</span>
              </button>
            ))}
          </div>
          <div className="shop-foot">
            <span>
              Tienes: {ITEM_KEYS.filter((k) => run.items[k] > 0).map((k) => `${ITEMS[k].name} ×${run.items[k]}`).join(', ') || 'nada'}
            </span>
          </div>
          <div className="dialog-buttons">
            <Button onClick={rest} disabled={run.gold < REST_PRICE || run.hp >= run.maxHp} title="Recupera 1 vida">
              Descansar ({REST_PRICE} oro)
            </Button>
            <Button primary onClick={descend} autoFocus>
              Bajar al piso {run.floor + 1}
            </Button>
          </div>
        </Dialog>
      )}

      {(run.phase === 'dead' || run.phase === 'won') && (
        <Dialog title={run.phase === 'won' ? '¡Has escapado!' : 'Fin de la partida'} width={340}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ marginTop: 2 }}>{run.phase === 'won' ? <Coin size={32} /> : <Skull size={32} />}</div>
            <div>
              <p style={{ margin: '0 0 6px' }}>
                {run.phase === 'won' ? (
                  <b>Has cruzado los {FINAL_FLOOR} pisos y vuelves a ver la luz del sol.</b>
                ) : (
                  <b>
                    Has muerto en el piso {run.floor}: {run.floorName}.
                  </b>
                )}
              </p>
              <table className="best">
                <tbody>
                  <tr>
                    <td>Pisos despejados:</td>
                    <td>{run.stats.floorsCleared}</td>
                  </tr>
                  <tr>
                    <td>Oro conseguido:</td>
                    <td>{run.stats.goldEarned}</td>
                  </tr>
                  <tr>
                    <td>Explosiones:</td>
                    <td>{run.stats.hits}</td>
                  </tr>
                  <tr>
                    <td>Minas desactivadas:</td>
                    <td>{run.stats.defused}</td>
                  </tr>
                  <tr>
                    <td>Tiempo:</td>
                    <td>{run.time} s</td>
                  </tr>
                  <tr>
                    <td>Semilla:</td>
                    <td>{run.seedText}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="dialog-buttons">
            <Button primary onClick={abandon} autoFocus>
              Nueva partida
            </Button>
            <Button onClick={onClassic}>Buscaminas clásico</Button>
          </div>
        </Dialog>
      )}

      {dialog === 'help' && (
        <Dialog title="Cómo jugar al modo Rogue" onClose={() => setDialog(null)} width={400}>
          <ul className="help">
            <li>Se juega como el Buscaminas normal, pero pisar una mina no termina la partida: pierdes una vida y sigues.</li>
            <li>Despeja todas las casillas seguras para bajar de piso. Cada piso es más grande y tiene más minas.</li>
            <li>Algunas casillas esconden oro. Se ve al descubrirlas.</li>
            <li>Entre piso y piso pasas por la tienda. Cada 3 pisos eliges una reliquia con efecto permanente.</li>
            <li>Si te quedas sin vidas, la partida termina. Escapas al despejar el piso {FINAL_FLOOR}.</li>
            <li>La semilla determina la partida: con la misma semilla y los mismos clics, salen las mismas minas.</li>
          </ul>
          <div className="dialog-buttons">
            <Button primary onClick={() => setDialog(null)}>
              Aceptar
            </Button>
          </div>
        </Dialog>
      )}

      {dialog === 'items' && (
        <Dialog title="Objetos y reliquias" onClose={() => setDialog(null)} width={420}>
          <b>Objetos (se gastan)</b>
          <table className="glossary">
            <tbody>
              {ITEM_KEYS.map((k) => (
                <tr key={k}>
                  <td>
                    <ItemIcon kind={k} />
                  </td>
                  <td>
                    <b>{ITEMS[k].name}</b>
                  </td>
                  <td>{ITEMS[k].desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <b>Reliquias (permanentes)</b>
          <table className="glossary">
            <tbody>
              {Object.keys(RELICS).map((k) => (
                <tr key={k}>
                  <td>
                    <RelicIcon kind={k} size={16} />
                  </td>
                  <td>
                    <b>{RELICS[k].name}</b>
                  </td>
                  <td>{RELICS[k].desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
