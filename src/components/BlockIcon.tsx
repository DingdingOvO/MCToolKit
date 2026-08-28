import { useState, useEffect } from 'react'
import type { Block } from '../types'
import { renderBlock } from '../lib/blockRenderer'

interface Props {
  block: Block
  /** Edge length — icon will be 2*e × 2*e px. Use even numbers. */
  e?: number
  className?: string
}

export default function BlockIcon({ block, e = 18, className }: Props) {
  const [src, setSrc] = useState('')
  const size = 2 * e

  useEffect(() => {
    let cancelled = false
    renderBlock(block.faces.up, block.faces.north, block.faces.east, e, block.id)
      .then(r => { if (!cancelled) setSrc(r.dataUrl) })
    return () => { cancelled = true }
  }, [block.id, block.faces.up, block.faces.north, block.faces.east, e])

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: src ? `url(${src})` : undefined,
        imageRendering: 'pixelated',
      }}
    />
  )
}
