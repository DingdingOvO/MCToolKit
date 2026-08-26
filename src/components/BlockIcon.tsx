import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/**
 * CSS 3D isometric Minecraft block renderer.
 * Uses transform-style: preserve-3d.
 *
 * Key: NO filter/brightness on face divs — filter breaks 3D rendering.
 * Instead, overlay a semi-transparent div for MC-style directional shading.
 *
 * Isometric: rotateX(-35.264deg) rotateY(-45deg)
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  const half = s / 2
  const w = Math.ceil(s * 1.42)
  const h = Math.ceil(s * 1.64)

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: s, height: s,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
  }

  // Overlay for MC-style directional lighting
  const overlay = (opacity: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0, left: 0,
    width: s, height: s,
    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    pointerEvents: 'none',
  })

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
        {/* Top face — brightest, no overlay */}
        <div style={{
          ...faceBase,
          transform: `rotateX(-90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.up}.png)`,
        }} />
        {/* Front/north face — medium shade */}
        <div style={{
          ...faceBase,
          transform: `translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.north}.png)`,
        }}>
          <div style={overlay(0.15)} />
        </div>
        {/* Right/east face — darkest */}
        <div style={{
          ...faceBase,
          transform: `rotateY(90deg) translateZ(${half}px)`,
          backgroundImage: `url(${BASE}/${block.east}.png)`,
        }}>
          <div style={overlay(0.30)} />
        </div>
      </div>
    </div>
  )
}
