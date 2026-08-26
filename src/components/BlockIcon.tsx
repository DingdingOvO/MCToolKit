import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/**
 * CSS 3D isometric Minecraft block renderer.
 * Uses transform-style: preserve-3d with proper face transforms.
 *
 * Isometric angles: rotateX(-35.264deg) rotateY(-45deg)
 *   - 35.264° = arctan(1/√2) gives true isometric projection
 *   - rotateY(-45deg) so east/right face is on the right side
 *
 * Visible faces:
 *   - Top  (y=0 plane, normal -Y)  → rotateX(-90deg) translateZ(s/2)
 *   - Front (z=s/2 plane, normal +Z) → translateZ(s/2)
 *   - Right (x=s plane, normal +X)  → rotateY(90deg) translateZ(s/2)
 *
 * Projected bounding box: ~1.414s × ~1.633s
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  const half = s / 2
  const w = Math.ceil(s * 1.42)
  const h = Math.ceil(s * 1.64)

  const face: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: s, height: s,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
    backfaceVisibility: 'hidden' as const,
  }

  return (
    <div style={{ width: w, height: h, position: 'relative' }}>
      <div style={{
        width: s, height: s,
        position: 'absolute',
        left: (w - s) / 2,
        top: (h - s) / 2,
        transformStyle: 'preserve-3d',
        transform: 'rotateX(-35.264deg) rotateY(-45deg)',
      }}>
        {/* Top face — brightest */}
        <div style={{
          ...face,
          transform: `rotateX(-90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.up}.png)`,
        }} />
        {/* Front/north face — medium (appears as left side) */}
        <div style={{
          ...face,
          transform: `translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.north}.png)`,
          filter: 'brightness(0.85)',
        }} />
        {/* Right/east face — darkest */}
        <div style={{
          ...face,
          transform: `rotateY(90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.east}.png)`,
          filter: 'brightness(0.7)',
        }} />
      </div>
    </div>
  )
}
