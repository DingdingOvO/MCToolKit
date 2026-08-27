import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

const S3 = Math.sqrt(3) // ≈ 1.732

/*
 * True 30° isometric Minecraft block via CSS matrix transforms.
 *
 * For container size = s, face divs are s/2 × s/2.
 * Each matrix maps the square div to the correct parallelogram,
 * with all shared edges perfectly aligned.
 *
 * Cube vertices (s=32 example):
 *   Diamond (top):  A(16,0)  B(30,8)  C(16,16)  D(2,8)
 *   Left side:      D(2,8)   C(16,16) F(16,32)  G(2,24)
 *   Right side:     C(16,16) B(30,8)  E(30,24)  F(16,32)
 *
 * Paint order: left → right → top (back to front)
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  const L = s / 2
  const dx = s * (2 - S3) / 4 // ≈ s * 0.067, centers cube horizontally

  const face: React.CSSProperties = {
    position: 'absolute',
    width: L,
    height: L,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
  }

  return (
    <div style={{ width: s, height: s, position: 'relative' }}>
      {/* Left side (north texture) — medium shade */}
      <div
        style={{
          ...face,
          transform: `matrix(${S3 / 2}, 0.5, 0, 1, ${dx}, ${s / 4})`,
          backgroundImage: `url(${BASE}/${block.north}.png)`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }} />
      </div>

      {/* Right side (east texture) — dark shade */}
      <div
        style={{
          ...face,
          transform: `matrix(${S3 / 2}, -0.5, 0, 1, ${s / 2}, ${s / 2})`,
          backgroundImage: `url(${BASE}/${block.east}.png)`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.30)', pointerEvents: 'none' }} />
      </div>

      {/* Top face (up texture) — brightest */}
      <div
        style={{
          ...face,
          transform: `matrix(${S3 / 2}, 0.5, ${S3 / 2}, -0.5, ${dx}, ${s / 4})`,
          backgroundImage: `url(${BASE}/${block.up}.png)`,
        }}
      />
    </div>
  )
}
