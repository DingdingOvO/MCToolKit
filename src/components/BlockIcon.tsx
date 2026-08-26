import { useRef, useEffect } from 'react'
import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

/**
 * Canvas-based isometric block renderer.
 * Draws a Minecraft-style isometric cube with 3 visible faces:
 *   top (brightest), front/north (medium), right/east (darkest)
 *
 * Isometric math:
 *   angle = 30° (from horizontal)
 *   top face: parallelogram going up-right and up-left
 *   front face: parallelogram going down-left and down-right
 *   right face: parallelogram going down-right and up-right
 */
const IMAGES: Record<string, HTMLImageElement> = {}
const LOADING: Record<string, Promise<HTMLImageElement>> = {}

function loadImage(src: string): Promise<HTMLImageElement> {
  if (IMAGES[src]) return Promise.resolve(IMAGES[src])
  if (LOADING[src]) return LOADING[src]
  const p = new Promise<HTMLImageElement>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { IMAGES[src] = img; resolve(img) }
    img.onerror = () => resolve(img) // resolve anyway to not hang
    img.src = src
  })
  LOADING[src] = p
  return p
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  // 4 corner points of the face in canvas coords
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  // source rect from texture (pixel coords)
  sx: number, sy: number, sw: number, sh: number,
  brightness: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x3, y3)
  ctx.closePath()
  ctx.clip()

  // Apply brightness
  if (brightness !== 1) {
    ctx.filter = `brightness(${brightness})`
  }

  // Draw texture stretched to the parallelogram using affine transform
  // We need to map the source rect to the destination quad
  // For simplicity, use drawImage with transform
  const dx = x0, dy = y0
  const dw = Math.sqrt((x1-x0)**2 + (y1-y0)**2) // width of left edge
  const dh = Math.sqrt((x3-x0)**2 + (y3-y0)**2) // height of bottom edge

  // Calculate angle of the bottom edge for rotation
  const angle = Math.atan2(y1 - y0, x1 - x0)
  const angleV = Math.atan2(y3 - y0, x3 - x0)

  ctx.translate(x0, y0)
  ctx.rotate(angle)
  // Skew to match the other edge direction
  const skewX = Math.tan(angleV - angle - Math.PI/2) * (dh / dw)
  ctx.transform(1, 0, skewX, 1, 0, 0)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh)

  ctx.restore()
}

export default function BlockIcon({ block, size = 32 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const s = size
  // Isometric: 30° angle from horizontal
  // For a unit cube of side s, the projected dimensions:
  //   width = s * cos(30°) * 2 = s * sqrt(3)
  //   height = s * sin(30°) + s = s * 1.5
  const cos30 = Math.cos(Math.PI / 6)  // ~0.866
  const sin30 = 0.5
  const w = s * cos30  // half-width of top face
  const h = s * sin30  // height offset of top face

  const canvasW = Math.ceil(w * 2)
  const canvasH = Math.ceil(s + h)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cx = canvas.width / 2
    const baseY = canvas.height // bottom of the block

    // Define the 3 visible face quads (in canvas coordinates)
    // Top face (brightest)
    const top = [
      [cx, baseY - s - h],     // top point
      [cx + w, baseY - s],       // right point
      [cx, baseY - s + h],       // bottom point
      [cx - w, baseY - s],       // left point
    ]
    // Front/north face (medium brightness)
    const front = [
      [cx - w, baseY - s],       // top-left
      [cx, baseY - s + h],       // top-right
      [cx, baseY],               // bottom-right
      [cx - w, baseY - h],       // bottom-left
    ]
    // Right/east face (darkest)
    const right = [
      [cx, baseY - s + h],       // top-left
      [cx + w, baseY - s],       // top-right
      [cx + w, baseY - h],       // bottom-right
      [cx, baseY],               // bottom-left
    ]

    // Load textures and draw
    const texSize = 16 // MC textures are 16x16
    let pending = 0

    function drawIfReady() {
      if (pending > 0) return

      // Draw faces back-to-front: top, front, right
      // Actually for isometric: right, front, top (painter's algorithm)
      // But since faces don't overlap in standard isometric, order doesn't matter much
      // MC draws: front, right, top

      // Front face (medium)
      if (IMAGES[block.north]) {
        drawFace(ctx, IMAGES[block.north],
          front[0][0], front[0][1], front[1][0], front[1][1],
          front[2][0], front[2][1], front[3][0], front[3][1],
          0, 0, texSize, texSize,
          0.85
        )
      }

      // Right face (dark)
      if (IMAGES[block.east]) {
        drawFace(ctx, IMAGES[block.east],
          right[0][0], right[0][1], right[1][0], right[1][1],
          right[2][0], right[2][1], right[3][0], right[3][1],
          0, 0, texSize, texSize,
          0.7
        )
      }

      // Top face (bright)
      if (IMAGES[block.up]) {
        drawFace(ctx, IMAGES[block.up],
          top[0][0], top[0][1], top[1][0], top[1][1],
          top[2][0], top[2][1], top[3][0], top[3][1],
          0, 0, texSize, texSize,
          1.0
        )
      }
    }

    const sources = [block.up, block.north, block.east]
    for (const src of sources) {
      const url = `/MCToolKit/textures/${src}.png`
      if (IMAGES[url]) continue
      pending++
      loadImage(url).then(() => { pending--; drawIfReady() })
    }

    drawIfReady()
  }, [block, s, canvasW, canvasH, w, h])

  return (
    <canvas
      ref={canvasRef}
      width={canvasW * 2} // 2x for retina
      height={canvasH * 2}
      style={{ width: canvasW, height: canvasH, imageRendering: 'pixelated' }}
    />
  )
}
