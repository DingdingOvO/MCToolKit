import { useRef, useCallback, useState } from 'react'
import type { Block } from '../types'

const BASE = '/MCToolKit/textures/block'

export default function RotatableBlock({ block, size }: { block: Block; size: number }) {
  const [rx, setRx] = useState(-30)
  const [ry, setRy] = useState(45)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  const onDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    last.current = { x: e.clientX, y: e.clientY }
    setRy(r => r + dx * 0.6)
    setRx(r => Math.max(-80, Math.min(80, r - dy * 0.6)))
  }, [])

  const onUp = useCallback(() => { dragging.current = false }, [])

  const s = Math.round(size)
  const half = s / 2

  // Face base style — exact size, no overlap
  const face: React.CSSProperties = {
    position: 'absolute',
    width: s,
    height: s,
    top: 0,
    left: 0,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
    backfaceVisibility: 'hidden' as const,
  }

  // Standard CSS 3D cube — MDN reference transforms, no overlap
  const faces = [
    { tex: block.faces.up,    tx: `rotateX(90deg) translateZ(${half}px)` },
    { tex: block.faces.down,  tx: `rotateX(-90deg) translateZ(${half}px)` },
    { tex: block.faces.north, tx: `translateZ(${half}px)` },
    { tex: block.faces.south, tx: `rotateY(180deg) translateZ(${half}px)` },
    { tex: block.faces.east,  tx: `rotateY(90deg) translateZ(${half}px)` },
    { tex: block.faces.west,  tx: `rotateY(-90deg) translateZ(${half}px)` },
  ]

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ width: s, height: s, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
    >
      <div style={{
        width: s, height: s,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
        willChange: 'transform',
      }}>
        {faces.map((f, i) => (
          <div key={i} style={{
            ...face,
            transform: f.tx,
            backgroundImage: `url(${BASE}/${f.tex}.png)`,
          }} />
        ))}
      </div>
    </div>
  )
}