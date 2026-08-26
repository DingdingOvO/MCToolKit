export interface Item {
  id: string
  texture: string
  name: Record<string, string>
}

export interface Block {
  id: string
  texture: string
}

export interface Sound {
  id: string
  path: string
  category: string
}
