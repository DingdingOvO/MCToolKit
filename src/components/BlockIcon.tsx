import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
  className?: string
}

const BASE = '/MCToolKit/textures/block'

/**
 * CSS 3D isometric Minecraft block icon.
 * Based on the proven preserve-3d approach with true isometric angles.
 *
 * Isometric: rotateX(-35.264deg) rotateY(-45deg)
 *   35.264° = arctan(1/√2) → true isometric projection
 *
 * Seams fix: each face is 2px larger than the cube side,
 * offset by -1px so faces overlap at edges → no visible gaps.
 *
 * Visible faces:
 *   Top  (up)    — brightest, no filter
 *   North (left) — medium, brightness(0.85)
 *   East  (right)— darkest,  brightness(0.7)
 */
export default function BlockIcon({ block, size = 32, className }: Props) {
  const s = size
  const half = s / 2
  // Projected bounding box of the isometric cube
  const w = Math.ceil(s * 1.42)
  const h = Math.ceil(s * 1.64)

  // Each face extends 1px beyond the cube on every side to cover seams.
  // Face center stays at (s/2, s/2) since: -1 + (s+2)/2 = s/2
  const O = 1 // overlap px

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    top: -O,
    left: -O,
    width: s + O * 2,
    height: s + O * 2,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
    backfaceVisibility: 'hidden' as const,
  }

  return (
    <div className={className} style={{ width: w, height: h, position: 'relative' }}>
      <div style={{
        width: s,
        height: s,
        position: 'absolute',
        left: (w - s) / 2,
        top: (h - s) / 2,
        transformStyle: 'preserve-3d',
        transform: 'rotateX(-35.264deg) rotateY(-45deg)',
        willChange: 'transform',
      }}>
        {/* Top face — brightest */}
        <div style={{
          ...faceBase,
          transform: `rotateX(-90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.faces.up}.png)`,
        }} />
        {/* North face (appears as left side) — medium shade */}
        <div style={{
          ...faceBase,
          transform: `translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.faces.north}.png)`,
          filter: 'brightness(0.85)',
        }} />
        {/* East face (appears as right side) — darkest */}
        <div style={{
          ...faceBase,
          transform: `rotateY(90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.faces.east}.png)`,
          filter: 'brightness(0.7)',
        }} />
      </div>
    </div>
  )
}
