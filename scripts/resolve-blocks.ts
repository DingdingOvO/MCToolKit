import * as fs from 'fs'
import * as path from 'path'

const MODELS_DIR = path.resolve('assets/extracted/assets/minecraft/models/block')
const OLD_BLOCKS = path.resolve('src/data/blocks.json')
const TEXTURES_DIR = path.resolve('public/textures/block')
const OUTPUT = path.resolve('src/data/blocks.json')

const cache = new Map<string, any>()

function load(name: string): any | null {
  if (cache.has(name)) return cache.get(name)
  const p = path.join(MODELS_DIR, `${name}.json`)
  if (!fs.existsSync(p)) { cache.set(name, null); return null }
  try {
    const m = JSON.parse(fs.readFileSync(p, 'utf-8'))
    cache.set(name, m)
    return m
  } catch {
    cache.set(name, null)
    return null
  }
}

/** Walk up the parent chain, collect models in order [leaf, ..., root] */
function getChain(name: string, depth = 0): any[] {
  if (depth > 15) return []
  const m = load(name)
  if (!m) return []
  const chain = [m]
  if (m.parent && m.parent !== 'minecraft:block/block' && m.parent !== 'block/block') {
    const parentName = m.parent.replace('minecraft:block/', '').replace('block/', '')
    const parentChain = getChain(parentName, depth + 1)
    chain.push(...parentChain)
  }
  return chain
}

/** Merge textures from root → leaf (later overrides earlier) */
function mergeTextures(chain: any[]): Record<string, string> {
  const tex: Record<string, string> = {}
  for (const m of [...chain].reverse()) {
    if (m.textures) Object.assign(tex, m.textures)
  }
  return tex
}

/** Resolve all texture variables — strip # before map lookup */
function resolveTex(tex: string, map: Record<string, string>, seen = new Set<string>()): string | null {
  if (!tex.startsWith('#')) return tex
  const key = tex.slice(1)
  if (seen.has(key)) return null
  seen.add(key)
  const val = map[key]
  if (!val) return null
  if (typeof val !== 'string') return null
  if (val.startsWith('#')) return resolveTex(val, map, seen)
  return val
}

/** Find first model in chain that has elements, extract 6-face textures */
function extractFaces(chain: any[], texMap: Record<string, string>): Record<string, string> | null {
  for (const m of chain) {
    if (!m.elements || !Array.isArray(m.elements)) continue
    const faces: Record<string, string> = {}
    for (const elem of m.elements) {
      if (!elem.faces) continue
      for (const [face, data] of Object.entries(elem.faces)) {
        if (faces[face]) continue // already have this face
        const d = data as any
        if (d.texture) {
          const resolved = resolveTex(d.texture, texMap)
          if (resolved) faces[face] = resolved
        }
      }
    }
    if (Object.keys(faces).length > 0) return faces
  }
  return null
}

function texExists(name: string): boolean {
  const short = name.replace(/^minecraft:block\//, '').replace(/^block\//, '')
  return fs.existsSync(path.join(TEXTURES_DIR, `${short}.png`))
}

function toShort(name: string): string {
  return name.replace(/^minecraft:block\//, '').replace(/^block\//, '')
}

// ---- Main ----
const oldBlocks: any[] = JSON.parse(fs.readFileSync(OLD_BLOCKS, 'utf-8'))
const results: any[] = []
let resolved = 0
let fallback = 0

for (const block of oldBlocks) {
  const candidates = [block.id, `${block.id}_inventory`, `${block.id}_side`, `${block.id}_top`]
  let faces: Record<string, string> | null = null

  for (const name of candidates) {
    const chain = getChain(name)
    if (!chain.length) continue
    const texMap = mergeTextures(chain)
    faces = extractFaces(chain, texMap)
    if (faces && Object.keys(faces).length >= 3) break
    faces = null
  }

  if (faces && Object.keys(faces).length >= 3) {
    const clean: Record<string, string> = {}
    for (const key of ['up', 'down', 'north', 'south', 'east', 'west']) {
      if (faces[key]) {
        const short = toShort(faces[key])
        if (texExists(short)) clean[key] = short
      }
    }
    if (Object.keys(clean).length >= 3) {
      results.push({ id: block.id, faces: clean, name: block.name })
      resolved++
      continue
    }
  }

  // Fallback: old data + symmetry
  const oldUp = block.up?.replace(/^block\//, '') || ''
  const oldNorth = block.north?.replace(/^block\//, '') || ''
  const oldEast = block.east?.replace(/^block\//, '') || ''
  if (oldNorth || oldUp) {
    const f: Record<string, string> = {}
    f.up = oldUp || oldNorth
    f.down = oldUp || oldNorth
    f.north = oldNorth
    f.south = oldNorth
    f.east = oldEast || oldNorth
    f.west = oldEast || oldNorth
    results.push({ id: block.id, faces: f, name: block.name })
    fallback++
  }
}

console.log(`Resolved: ${resolved}, Fallback: ${fallback}, Total: ${results.length}`)
fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf-8')
console.log(`Written to ${OUTPUT}`)
