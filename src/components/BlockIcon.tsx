import { useId } from 'react'
import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

const BASE = '/MCToolKit/textures'

/*
 * Isometric Minecraft block icon — pure SVG with clipPath.
 *
 * Each face is an <image> transformed by a matrix to match the
 * isometric projection, then clipped by a <clipPath> polygon that
 * uses the EXACT SAME vertex coordinates.  Because the clip boundary
 * is a vector operation (not a rasterised div edge), there are no
 * sub-pixel gaps between adjacent faces.
 *
 * Vertex layout (s = container size, a = s/2 = projected edge length):
 *
 *              top (cx, cy−a)
 *             /    \
 *       left *------* right          cx = s/2, cy = s/2
 *           |\ top /|               d  = s·√3 / 4
 *           | \   / |               a  = s / 2
 *           |  \ /  |
 *           | mid *  |
 *           |  / \  |
 *           | /   \ |
 *           |/ bot \
 *          bl *------* br
 *             \    /
 *              bot (cx, cy+a)
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const uid = useId()
  const s = size
  const cx = s / 2
  const cy = s / 2
  const a = s / 2
  const d = s * Math.sqrt(3) / 4

  /* ---- compute 7 vertices ONCE, reuse everywhere ---- */
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

  /* matrix coefficients: d/a = √3/2 ≈ 0.866 */
  const da = d / a

  /*
   * Image transforms — each maps a 0→a rectangle to the face
   * parallelogram.  The image corners land on the polygon vertices
   * so the clip-path cuts away nothing and leaves no gap.
   *
   * Left face:  (0,0)→left  (a,0)→mid    (0,a)→bl    (a,a)→bot
   * Right face: (0,0)→mid   (a,0)→right  (0,a)→br    (a,a)→bot
   * Top face:   (0,0)→left  (a,0)→mid    (0,a)→top   (a,a)→right
   */
  const leftTx  = `matrix(${da} 0.5 0 1 ${V.left[0]} ${V.left[1]})`
  const rightTx = `matrix(${da} -0.5 0 1 ${V.mid[0]} ${V.mid[1]})`
  const topTx   = `matrix(${da} 0.5 ${da} -0.5 ${V.left[0]} ${V.left[1]})`

  const imgStyle: React.CSSProperties = { imageRendering: 'pixelated' as const }

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
          style={imgStyle}
        />
        <polygon points={leftPoly} fill="rgba(0,0,0,0.15)" />
      </g>

      {/* Right (east) — dark shade */}
      <g clipPath={`url(#r${uid})`}>
        <image
          href={`${BASE}/${block.east}.png`}
          width={a} height={a}
          transform={rightTx}
          style={imgStyle}
        />
        <polygon points={rightPoly} fill="rgba(0,0,0,0.30)" />
      </g>

      {/* Top (up) — brightest, no shade */}
      <g clipPath={`url(#t${uid})`}>
        <image
          href={`${BASE}/${block.up}.png`}
          width={a} height={a}
          transform={topTx}
          style={imgStyle}
        />
      </g>
    </svg>
  )
}
