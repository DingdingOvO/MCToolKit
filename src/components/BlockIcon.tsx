import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
  className?: string
}

const BASE = '/MCToolKit/textures/block'

export default function BlockIcon({ block, size = 32, className }: Props) {
  // Ensure integer size to avoid sub-pixel seams
  const s = Math.round(size)
  const half = s / 2
  // Isometric bounding box
  const w = Math.round(s * 1.42)
  const h = Math.round(s * 1.64)

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

  return (
    <div className={className} style={{ width: w, height: h, position: 'relative' }}>
      <div style={{
        width: s, height: s,
        position: 'absolute',
        left: (w - s) / 2,
        top: (h - s) / 2,
        transformStyle: 'preserve-3d',
        transform: 'rotateX(-35.264deg) rotateY(-45deg)',
        willChange: 'transform',
      }}>
        {/* Top face */}
        <div style={{
          ...face,
          transform: `rotateX(90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.faces.up}.png)`,
        }} />
        {/* North face (front) */}
        <div style={{
          ...face,
          transform: `translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.faces.north}.png)`,
          filter: 'brightness(0.85)',
        }} />
        {/* East face (right) */}
        <div style={{
          ...face,
          transform: `rotateY(90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.faces.east}.png)`,
          filter: 'brightness(0.7)',
        }} />
      </div>
    </div>
  )
}