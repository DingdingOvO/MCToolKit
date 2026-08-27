import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/*
 * CSS isometric Minecraft block renderer.
 * Uses the user-specified pattern with preserve-3d.
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  const w = Math.ceil(s * 1.42)
  const h = Math.ceil(s * 1.58)

  const face: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: s, height: s,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
  }

  return (
    <div style={{ width: w, height: h, position: 'relative' }}>
      <div style={{
        width: s, height: s,
        position: 'absolute',
        left: Math.round((w - s) / 2),
        top: Math.round((h - s) / 2),
        transformStyle: 'preserve-3d',
      }}>
        {/* Top face — diamond */}
        <div style={{
          ...face,
          transform: 'rotateX(60deg) rotateZ(45deg)',
          backgroundImage: `url(${BASE}/${block.up}.png)`,
        }} />
        {/* Left face */}
        <div style={{
          ...face,
          transform: 'rotateY(45deg) skewY(30deg)',
          transformOrigin: 'left top',
          backgroundImage: `url(${BASE}/${block.north}.png)`,
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }} />
        </div>
        {/* Right face */}
        <div style={{
          ...face,
          transform: 'rotateY(-45deg) skewY(-30deg)',
          transformOrigin: 'right top',
          backgroundImage: `url(${BASE}/${block.east}.png)`,
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.30)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  )
}
