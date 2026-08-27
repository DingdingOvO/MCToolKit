import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  // 给足渲染空间，防止被裁切
  const w = s * 1.73 
  const h = s * 1.73 

  return (
    <div style={{ width: w, height: h, position: 'relative' }}>
      {/* 将三个面的中心点完全对齐 */}
      <div style={{
        width: s, height: s,
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        transformStyle: 'preserve-3d',
      }}>
        
        {/* 顶面：标准角度 (修正了 origin，并在 transform 里加上 translate 居中) */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BASE}/${block.up}.png)`,
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
          transform: 'rotateX(60deg) rotateZ(45deg)',
        }} />
        
        {/* 左面 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BASE}/${block.north}.png)`,
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
          transform: 'rotateY(45deg) skewY(30deg)',
          transformOrigin: 'left top',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        </div>
        
        {/* 右面 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BASE}/${block.east}.png)`,
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
          transform: 'rotateY(-45deg) skewY(-30deg)',
          transformOrigin: 'right top',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.30)' }} />
        </div>
      </div>
    </div>
  )
}
