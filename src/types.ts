export interface Item {
  id: string
  texture: string
  name: Record<string, string>
}

export interface Block {
  id: string
  up: string | null     // texture path like 'block/stone'
  north: string | null   // front face
  east: string | null    // right face
}

export interface Sound {
  id: string
  path: string
  category: string
}
