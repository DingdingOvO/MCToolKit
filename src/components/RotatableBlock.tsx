import { useRef, useCallback, useState } from 'react'
import type { Block } from '../types'

const BASE = '/MCToolKit/textures/block'

/**
 * Interactive rotatable 3D block for the detail modal.
 * All 6 faces rendered. Drag to rotate. No auto-rotation.
 * Uses CSS preserve-3d with dynamic rotateX/rotateY.
 */
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

  const onUp = useCallback(() => {
    dragging.current = false
  }, [])

  const s = size
  const half = s / 2
  const O = 1

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    top: -O, left: -O,
    width: s + O * 2,
    height: s + O * 2,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
    backfaceVisibility: 'hidden' as const,
  }

  const faces: { tex: string; tx: string; filter?: string }[] = [
    { tex: block.faces.up,    tx: `rotateX(-90deg) translateZ(${half}px)` },
    { tex: block.faces.down,  tx: `rotateX(90deg) translateZ(${half}px)`, filter: 'brightness(0.5)' },
    { tex: block.faces.north, tx: `translateZ(${half}px)` },
    { tex: block.faces.south, tx: `rotateY(180deg) translateZ(${half}px)`, filter: 'brightness(0.65)' },
    { tex: block.faces.east,  tx: `rotateY(90deg) translateZ(${half}px)`, filter: 'brightness(0.7)' },
    { tex: block.faces.west,  tx: `rotateY(-90deg) translateZ(${half}px)`, filter: 'brightness(0.85)' },
  ]

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        width: s, height: s,
        cursor: dragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div style={{
        width: s, height: s,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
        willChange: 'transform',
        transition: dragging.current ? 'none' : undefined,
      }}>
        {faces.map((f, i) => (
          <div key={i} style={{
            ...faceBase,
            transform: f.tx,
            backgroundImage: `url(${BASE}/${f.tex}.png)`,
            filter: f.filter,
          }} />
        ))}
      </div>
    </div>
  )
}