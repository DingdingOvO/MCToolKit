import { useId } from 'react'
import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/*
 * Isometric Minecraft block icon — SVG with clipPath.
 *
 * Texture orientation follows Minecraft's standard isometric UV mapping:
 *   Left  (north): tex-x → X-axis on screen (right-down 30°)
 *                  tex-y → Y-axis on screen (straight down)
 *   Right (east):  tex-x → Z-axis on screen (left-down 30°)
 *                  tex-y → Y-axis on screen (straight down)
 *   Top   (up):   tex-x → X-axis on screen (right-down 30°)
 *                  tex-y → Z-axis on screen (left-down 30°)
 *
 *   top (cx, cy-a)
 *  /    \
 * left *------* right        cx = s/2, cy = s/2
 *  |\ top /|                 a  = s/2 (projected edge)
 *  | \   / |                 d  = s·√3/4
 *  |  \ /  |
 *  |  mid*  |
 *  |  / \  |
 *  | /   \ |
 *  |/ bot  \
 * bl *------* br
 *  \    /
 *   bot (cx, cy+a)
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const uid = useId()
  const s = size
  const cx = s / 2
  const cy = s / 2
  const a = s / 2
  const d = s * Math.sqrt(3) / 4
  const da = d / a /* √3/2 */

  /* ---- 7 vertices, computed once ---- */
  const V = {
    top:   [cx,     cy - a],
    left:  [cx - d, cy - a / 2],
    right: [cx + d, cy - a / 2],
    mid:   [cx,     cy],
    bl:    [cx - d, cy + a / 2],
    br:    [cx + d, cy + a / 2],
    bot:   [cx,     cy + a],
  } as const

  const pt = (v: readonly [number, number]) => `${v[0]},${v[1]}`

  const leftPoly  = `${pt(V.left)} ${pt(V.mid)} ${pt(V.bl)} ${pt(V.bot)}`
  const rightPoly = `${pt(V.mid)} ${pt(V.right)} ${pt(V.br)} ${pt(V.bot)}`
  const topPoly   = `${pt(V.top)} ${pt(V.right)} ${pt(V.mid)} ${pt(V.left)}`

  /*
   * Image transforms: map (0,0)→(a,a) source rect to face parallelogram.
   * Image corners MUST land exactly on polygon vertices.
   *
   * Left  (north): (0,0)→left  (a,0)→mid   (0,a)→bl   (a,a)→bot
   * Right (east):  (0,0)→mid   (a,0)→right (0,a)→bot   (a,a)→br
   * Top   (up):    (0,0)→top   (a,0)→right (0,a)→left  (a,a)→mid
   */
  const leftTx  = `matrix(${da} 0.5 0 1 ${V.left[0]} ${V.left[1]})`
  const rightTx = `matrix(${da} -0.5 0 1 ${V.mid[0]} ${V.mid[1]})`
  const topTx   = `matrix(${da} 0.5 ${-da} 0.5 ${V.top[0]} ${V.top[1]})`

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id={`l${uid}`}><polygon points={leftPoly} /></clipPath>
        <clipPath id={`r${uid}`}><polygon points={rightPoly} /></clipPath>
        <clipPath id={`t${uid}`}><polygon points={topPoly} /></clipPath>
      </defs>

      {/* Left (north) — medium shade */}
      <g clipPath={`url(#l${uid})`}>
        <image
          href={`${BASE}/${block.north}.png`}
          width={a} height={a}
          transform={leftTx}
          imageRendering="pixelated"
          style={{ imageRendering: 'pixelated' as const }}
        />
        <polygon points={leftPoly} fill="rgba(0,0,0,0.15)" />
      </g>

      {/* Right (east) — dark shade */}
      <g clipPath={`url(#r${uid})`}>
        <image
          href={`${BASE}/${block.east}.png`}
          width={a} height={a}
          transform={rightTx}
          imageRendering="pixelated"
          style={{ imageRendering: 'pixelated' as const }}
        />
        <polygon points={rightPoly} fill="rgba(0,0,0,0.30)" />
      </g>

      {/* Top (up) — brightest, no shade */}
      <g clipPath={`url(#t${uid})`}>
        <image
          href={`${BASE}/${block.up}.png`}
          width={a} height={a}
          transform={topTx}
          imageRendering="pixelated"
          style={{ imageRendering: 'pixelated' as const }}
        />
      </g>
    </svg>
  )
}
