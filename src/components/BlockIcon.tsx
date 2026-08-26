import type { Block } from '../types'

interface Props {
  block: Block
  size?: number
}

/**
 * CSS 3D isometric block renderer.
 * Shows top, front (north), and right (east) faces with Minecraft-style lighting.
 * Rotation: 45° Y (isometric angle), -35.264° X (tilt to see top face)
 */
export default function BlockIcon({ block, size = 32 }: Props) {
  const s = size
  // MC's isometric: rotateY(-45deg) rotateX(atan(1/√2)) ≈ 35.264°
  // But for CSS, we position 3 faces manually with skew transforms (simpler & sharper)

  // Top face: horizontal diamond
  // Front face: parallelogram (left-facing)
  // Right face: parallelogram (right-facing)

  const up = block.up
  const north = block.north || block.up
  const east = block.east || block.north || block.up

  if (!up && !north && !east) return null

  // Isometric dimensions for a unit cube side of `s` pixels
  // The projected isometric cube has:
  //   - top face: diamond, width = s*√2, height = s*√2/2
  //   - front face: parallelogram, width = s*√2/2, height = s*√2/2
  //   - right face: same as front
  // Total bounding box: w = s*√2, h = s + s*√2/2

  const sqrt2 = Math.SQRT2
  const topW = s * sqrt2
  const topH = s * sqrt2 / 2
  const faceW = s * sqrt2 / 2
  const faceH = s * sqrt2 / 2
  const totalW = topW
  const totalH = s + topH  // front height + top height

  // Using image-rendering: pixelated for crisp MC textures
  return (
    <div
      style={{
        width: totalW,
        height: totalH,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Top face - diamond shape */}
      {up && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: topW,
            height: topH,
            overflow: 'hidden',
          }}
        >
          <img
            src={`/MCToolKit/textures/${up}.png`}
            alt=''
            style={{
              width: topW * sqrt2,
              height: topW * sqrt2,
              position: 'absolute',
              top: -topW * sqrt2 / 2 + topW * 0.22,
              left: -topW * 0.25,
              transform: 'rotate(45deg)',
              transformOrigin: 'center center',
              imageRendering: 'pixelated',
            }}
          />
          {/* Brightness overlay for top face (MC lighting: top is brightest) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.10)',
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Front face (north) - left parallelogram */}
      {north && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: faceW,
            height: faceH,
            overflow: 'hidden',
          }}
        >
          <img
            src={`/MCToolKit/textures/${north}.png`}
            alt=''
            style={{
              width: s * sqrt2,
              height: s * sqrt2,
              position: 'absolute',
              transform: 'skewY(45deg)',
              transformOrigin: 'top left',
              imageRendering: 'pixelated',
            }}
          />
          {/* Slightly darker for front face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.08)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Right face (east) - right parallelogram */}
      {east && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: faceW,
            height: faceH,
            overflow: 'hidden',
          }}
        >
          <img
            src={`/MCToolKit/textures/${east}.png`}
            alt=''
            style={{
              width: s * sqrt2,
              height: s * sqrt2,
              position: 'absolute',
              transform: 'skewY(-45deg)',
              transformOrigin: 'top right',
              imageRendering: 'pixelated',
            }}
          />
          {/* Darkest for right face (MC lighting: right side is darkest) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.20)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
    </div>
  )
}
