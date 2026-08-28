import { useRef, useCallback, useState, useEffect } from 'react'
import type { Block } from '../types'
import { renderRotatableBlock, loadTexture } from '../lib/blockRenderer'

export default function RotatableBlock({ block, size }: { block: Block; size: number }) {
  const [rx, setRx] = useState(-30)
  const [ry, setRy] = useState(45)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  // Preload all 6 face textures
  useEffect(() => {
    const names = Object.values(block.faces)
    names.forEach(n => loadTexture(n))
  }, [block.faces])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      renderRotatableBlock(canvas, block.faces, rx, ry, size)
    }
    draw()
    // Re-draw on rotation change (driven by pointer events)
    return () => cancelAnimationFrame(rafRef.current)
  }, [block.faces, rx, ry, size])

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

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    />
  )
}
