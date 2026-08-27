import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  // 放宽外框，避免被裁切
  const w = Math.ceil(s * 1.73)
  const h = Math.ceil(s * 1.73)

  const face: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: s, height: s,
    backgroundSize: 'cover',
    imageRendering: 'pixelated' as const,
  }

  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden' }}>
      {/* 【关键】绝对不要加 preserve-3d！也不要加 transform: translate 居中 */}
      <div style={{
        width: s, height: s,
        position: 'absolute',
        left: Math.round((w - s) / 2),
        top: Math.round((h - s) / 2),
      }}>
        {/* 顶面：旋转45度，再沿Y轴压扁一半，完美贴合 */}
        <div style={{
          ...face,
          transform: 'rotate(-45deg) scaleY(0.5)',
          transformOrigin: 'center',
          backgroundImage: `url(${BASE}/${block.up}.png)`,
        }} />
        
        {/* 左面：向右下方倾斜 */}
        <div style={{
          ...face,
          transform: 'skewY(30deg)',
          transformOrigin: 'left top',
          backgroundImage: `url(${BASE}/${block.north}.png)`,
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }} />
        </div>
        
        {/* 右面：向左下方倾斜 */}
        <div style={{
          ...face,
          transform: 'skewY(-30deg)',
          transformOrigin: 'right top',
          backgroundImage: `url(${BASE}/${block.east}.png)`,
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.30)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  )
}
