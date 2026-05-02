export interface Repo {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface InventoryItem {
  id: string
  repo_id: string
  make: string
  model: string
  year: number
  price: number
  status: string
  bonus?: number // Este es el campo del Bono
}
