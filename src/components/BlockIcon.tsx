import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/*
 * CSS isometric Minecraft block renderer.
 * Based on Mozilla isometric transform formula — pure 2D, no preserve-3d.
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size

  const face: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
  }

  return (
    <div style={{ width: s, height: s, position: 'relative', overflow: 'hidden' }}>
      {/* 顶面 (菱形) */}
      <div style={{
        ...face,
        transform: 'rotate(-45deg) skew(15deg, 15deg)',
        backgroundImage: `url(${BASE}/${block.up}.png)`,
      }} />
      {/* 左侧面 */}
      <div style={{
        ...face,
        transform: 'rotate(15deg) skew(15deg, 15deg)',
        filter: 'brightness(0.85)',
        backgroundImage: `url(${BASE}/${block.north}.png)`,
      }} />
      {/* 右侧面 */}
      <div style={{
        ...face,
        transform: 'rotate(-15deg) skew(-15deg, -15deg)',
        filter: 'brightness(0.7)',
        backgroundImage: `url(${BASE}/${block.east}.png)`,
      }} />
    </div>
  )
}
