/*
 * Canvas-based isometric block renderer.
 * 2:1 pixel isometric projection — no CSS 3D, no seams, no overlap.
 * Each block = 1 div with a background image.
 */

const TEX_BASE = '/MCToolKit/textures/block'

// ── Texture image cache ──────────────────────────────────────────
const texCache = new Map<string, HTMLImageElement>()
const texLoading = new Map<string, Promise<HTMLImageElement>>()

export function loadTexture(name: string): Promise<HTMLImageElement> {
  const cached = texCache.get(name)
  if (cached) return Promise.resolve(cached)
  const pending = texLoading.get(name)
  if (pending) return pending

  const p = new Promise<HTMLImageElement>((resolve) => {
    const img = new Image()
    img.onload = () => {
      texCache.set(name, img)
      texLoading.delete(name)
      resolve(img)
    }
    img.onerror = () => {
      texLoading.delete(name)
      // Create a 16x16 magenta placeholder so rendering doesn't break
      const c = document.createElement('canvas')
      c.width = c.height = 16
      const cx = c.getContext('2d')!
      cx.fillStyle = '#ff00ff'
      cx.fillRect(0, 0, 16, 16)
      const fallback = new Image()
      fallback.src = c.toDataURL()
      fallback.onload = () => resolve(fallback)
    }
    img.src = `${TEX_BASE}/${name}.png`
  })
  texLoading.set(name, p)
  return p
}

export async function preloadTextures(names: string[]): Promise<void> {
  await Promise.allSettled(names.map(loadTexture))
}

// ── Static isometric render cache ────────────────────────────────
const renderCache = new Map<string, { dataUrl: string; w: number; h: number }>()

interface FaceTx {
  ox: number; oy: number          // origin
  ax: number; ay: number          // x-axis (texture right edge)
  bx: number; by: number          // y-axis (texture bottom edge)
  brightness: number
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  f: FaceTx,
) {
  const tw = img.naturalWidth
  const th = img.naturalHeight
  ctx.save()
  ctx.setTransform(
    f.ax / tw, f.ay / tw,
    f.bx / th, f.by / th,
    f.ox, f.oy,
  )
  ctx.imageSmoothingEnabled = false
  if (f.brightness < 1) ctx.filter = `brightness(${f.brightness})`
  ctx.drawImage(img, 0, 0)
  ctx.restore()
}

/*
 * 2:1 isometric projection of a unit cube:
 *   P(x,y,z) = (x - z,  (x + z) / 2 - y)
 *
 * Scaled by e, shifted by (+e, +e):
 *   A(0,0,0) → (e, e)
 *   B(1,0,0) → (2e, 1.5e)
 *   C(1,1,0) → (2e, 0.5e)
 *   D(0,1,0) → (e, 0)
 *   E(0,0,1) → (0, 1.5e)
 *   F(1,0,1) → (e, 2e)
 *   G(1,1,1) → (e, e)  [=A]
 *   H(0,1,1) → (0, 0.5e)
 *
 * Visible faces (from +x, -z, +y):
 *   Top (y=1):  D(e,0)  C(2e,0.5e)  G(e,e)  H(0,0.5e)
 *   North(z=0): D(e,0)  C(2e,0.5e)  B(2e,1.5e)  A(e,e)
 *   East (x=1): C(2e,0.5e)  B(2e,1.5e)  F(e,2e)  G(e,e)
 */

export async function renderBlock(
  topTex: string,
  northTex: string,
  eastTex: string,
  e: number,
  key: string,
): Promise<{ dataUrl: string; w: number; h: number }> {
  const cached = renderCache.get(key)
  if (cached) return cached

  const [topImg, northImg, eastImg] = await Promise.all([
    loadTexture(topTex),
    loadTexture(northTex),
    loadTexture(eastTex),
  ])

  const W = 2 * e
  const H = 2 * e
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const he = e / 2

  // Draw order: top → north → east (painter's algorithm)
  // Top face: origin=D, xAxis=DC, yAxis=DH
  drawFace(ctx, topImg, {
    ox: e, oy: 0,
    ax: e, ay: he,
    bx: -e, by: he,
    brightness: 1.0,
  })
  // North face: origin=D, xAxis=DC, yAxis=DA
  drawFace(ctx, northImg, {
    ox: e, oy: 0,
    ax: e, ay: he,
    bx: 0, by: e,
    brightness: 0.85,
  })
  // East face: origin=C, xAxis=CG, yAxis=CB
  drawFace(ctx, eastImg, {
    ox: 2 * e, oy: he,
    ax: -e, ay: he,
    bx: 0, by: e,
    brightness: 0.7,
  })

  const dataUrl = canvas.toDataURL('image/png')
  const result = { dataUrl, w: W, h: H }
  renderCache.set(key, result)
  return result
}

// ── Rotatable block (real-time canvas) ───────────────────────────

const CUBE_VERTS: [number, number, number][] = [
  [0,0,0], [1,0,0], [1,1,0], [0,1,0],   // bottom ring
  [0,0,1], [1,0,1], [1,1,1], [0,1,1],   // top ring
]

interface FaceDef {
  verts: number[]    // indices into CUBE_VERTS
  texKey: 'up' | 'down' | 'north' | 'south' | 'east' | 'west'
  normal: [number, number, number]
}

const FACE_DEFS: FaceDef[] = [
  { verts: [3,2,6,7], texKey: 'up',    normal: [0,-1, 0] },
  { verts: [0,1,5,4], texKey: 'down',  normal: [0, 1, 0] },
  { verts: [0,3,7,4], texKey: 'north', normal: [0, 0,-1] },
  { verts: [1,2,6,5], texKey: 'south', normal: [0, 0, 1] },
  { verts: [1,0,4,5], texKey: 'west',  normal: [-1, 0, 0] },
  { verts: [2,3,7,6], texKey: 'east',  normal: [ 1, 0, 0] },
]

function rotX(v: [number,number,number], a: number): [number,number,number] {
  const c = Math.cos(a), s = Math.sin(a)
  return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c]
}
function rotY(v: [number,number,number], a: number): [number,number,number] {
  const c = Math.cos(a), s = Math.sin(a)
  return [v[0]*c + v[2]*s, v[1], -v[0]*s + v[2]*c]
}

export function renderRotatableBlock(
  canvas: HTMLCanvasElement,
  faces: { [K in 'up'|'down'|'north'|'south'|'east'|'west']?: string },
  rx: number,
  ry: number,
  size: number,
) {
  const ctx = canvas.getContext('2d')!
  canvas.width = size
  canvas.height = size
  ctx.clearRect(0, 0, size, size)

  const e = size * 0.35   // cube edge in pixels
  const cx = size / 2
  const cy = size / 2
  const rxR = rx * Math.PI / 180
  const ryR = ry * Math.PI / 180

  // Project vertices
  const projected = CUBE_VERTS.map(v => {
    let p: [number,number,number] = [(v[0]-0.5)*e, (v[1]-0.5)*e, (v[2]-0.5)*e]
    p = rotX(p, rxR)
    p = rotY(p, ryR)
    return { x: cx + p[0], y: cy - p[1], z: p[2] }
  })

  // Determine visible faces & sort by depth
  const visibleFaces = FACE_DEFS
    .map(fd => {
      const n = rotY(rotX(fd.normal, rxR), ryR)
      return { ...fd, viewZ: n[2], avgZ: fd.verts.reduce((s,i) => s + projected[i].z, 0) / 4 }
    })
    .filter(f => f.viewZ < 0)   // face normal points toward camera
    .sort((a, b) => b.avgZ - a.avgZ)  // back to front

  for (const face of visibleFaces) {
    const texName = faces[face.texKey] ?? 'stone'
    const img = texCache.get(texName)
    if (!img) continue

    const p = face.verts.map(i => projected[i])
    const tw = img.naturalWidth
    const th = img.naturalHeight

    // Affine transform: map texture rect to screen parallelogram
    // origin = p[0], xAxis = p[1]-p[0], yAxis = p[3]-p[0]
    const ox = p[0].x, oy = p[0].y
    const ax = (p[1].x - p[0].x) / tw, ay = (p[1].y - p[0].y) / tw
    const bx = (p[3].x - p[0].x) / th, by = (p[3].y - p[0].y) / th

    ctx.save()
    ctx.setTransform(ax, ay, bx, by, ox, oy)
    ctx.imageSmoothingEnabled = false
    // Directional brightness based on face normal
    const n = rotY(rotX(face.normal, rxR), ryR)
    const light = Math.max(0.55, Math.min(1.0, 0.5 - n[2] * 0.5 + Math.abs(n[0]) * 0.15 + Math.abs(n[1]) * 0.1))
    if (light < 0.95) ctx.filter = `brightness(${light})`
    ctx.drawImage(img, 0, 0)
    ctx.restore()
  }

  // Reset transform for future clears
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}
