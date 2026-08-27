import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/*
 * Isometric Minecraft block renderer using CSS matrix transforms.
 *
 * Math: each face is an (s/2)×(s/2) div mapped via matrix(a,b,c,d,tx,ty)
 * so that the three faces form a perfect isometric cube filling s×s.
 *
 * Vertices (for s=32, hs=16):
 *   Diamond (top):  (16,0) (32,8) (16,16) (0,8)
 *   Left side:      (0,8)  (16,16) (16,32) (0,24)
 *   Right side:     (16,16) (32,8) (32,24) (16,32)
 *
 * All edges shared exactly — no gaps, no overlaps.
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  const hs = s / 2

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    width: hs,
    height: hs,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
  }

  return (
    <div style={{ width: s, height: s, position: 'relative' }}>
      {/* Left side (north texture) — medium shade */}
      <div
        style={{
          ...faceBase,
          transform: `matrix(1, 0.5, 0, 1, 0, ${hs / 2})`,
          backgroundImage: `url(${BASE}/${block.north}.png)`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }} />
      </div>

      {/* Right side (east texture) — dark shade */}
      <div
        style={{
          ...faceBase,
          transform: `matrix(1, -0.5, 0, 1, ${hs}, ${hs})`,
          backgroundImage: `url(${BASE}/${block.east}.png)`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.30)', pointerEvents: 'none' }} />
      </div>

      {/* Top face (up texture) — brightest, no shade */}
      <div
        style={{
          ...faceBase,
          transform: `matrix(1, 0.5, -1, 0.5, ${hs}, 0)`,
          backgroundImage: `url(${BASE}/${block.up}.png)`,
        }}
      />
    </div>
  )
}
