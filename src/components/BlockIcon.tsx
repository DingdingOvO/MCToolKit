import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/*
 * True isometric (30°) Minecraft block renderer.
 *
 * Geometry (cube side = s):
 *   Container: W = s√3, H = 2s
 *
 *   Top face  (diamond):  rotateZ(45°) then scale(√1.5, 1/√2)
 *     → rhombus with 120°/60° angles, vertices at
 *       (W/2, 0), (W, H/4), (W/2, H/2), (0, H/4)
 *
 *   Left side (parallelogram):  div at (0, s/2) size (s√3/2 × s)
 *     → skewY(30deg) origin 0 0
 *     → maps to polygon (0%,25%) (50%,50%) (50%,100%) (0%,75%)
 *
 *   Right side (parallelogram): div at (s√3/2, s) size (s√3/2 × s)
 *     → skewY(-30deg) origin 0 0
 *     → maps to polygon (50%,0%) (100%,25%) (100%,75%) (50%,50%)
 *
 * Paint order (back→front): left, right, top
 */

const SQRT3 = Math.sqrt(3)
const SQRT3_2 = Math.sqrt(3 / 2)   // ≈ 1.2247
const INV_SQRT2 = 1 / Math.sqrt(2) // ≈ 0.7071

export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  const W = Math.round(s * SQRT3)
  const H = s * 2
  const sideW = Math.round((s * SQRT3) / 2)

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden' }}>
      {/* Left visual side (north texture) — painted first (back) */}
      <div
        style={{
          position: 'absolute',
          width: sideW,
          height: s,
          left: 0,
          top: Math.round(s / 2),
          transform: 'skewY(30deg)',
          transformOrigin: '0 0',
          backgroundImage: `url(${BASE}/${block.north}.png)`,
          backgroundSize: '100% 100%',
          imageRendering: 'pixelated' as const,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Right visual side (east texture) */}
      <div
        style={{
          position: 'absolute',
          width: sideW,
          height: s,
          left: sideW,
          top: s,
          transform: 'skewY(-30deg)',
          transformOrigin: '0 0',
          backgroundImage: `url(${BASE}/${block.east}.png)`,
          backgroundSize: '100% 100%',
          imageRendering: 'pixelated' as const,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.30)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Top face (up texture) — painted last (front) */}
      <div
        style={{
          position: 'absolute',
          width: s,
          height: s,
          left: Math.round((W - s) / 2),
          top: 0,
          transform: `rotateZ(45deg) scale(${SQRT3_2}, ${INV_SQRT2})`,
          transformOrigin: 'center center',
          backgroundImage: `url(${BASE}/${block.up}.png)`,
          backgroundSize: 'cover',
          imageRendering: 'pixelated' as const,
        }}
      />
    </div>
  )
}
