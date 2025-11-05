export interface Product {
  id: string
  barcode: string
  name: string
  supplier: string | null
  warrantyMonths: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductDto {
  barcode: string
  name: string
  supplier?: string
  warrantyMonths?: number
}

export interface ProductResponse {
  barcode: string
  name: string
  supplier: string
  warrantyMonths: number
}
