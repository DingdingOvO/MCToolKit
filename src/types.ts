export interface Item {
  id: string
  texture: string
  name: Record<string, string>
}

export interface BlockFaces {
  up: string
  down: string
  north: string
  south: string
  east: string
  west: string
}

export interface Block {
  id: string
  faces: BlockFaces
  name: Record<string, string>
}

export interface Sound {
  id: string
  path: string
  category: string
}
