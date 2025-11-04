import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export default async function productRoutes(fastify: FastifyInstance) {
  // Get product by barcode
  fastify.get('/product/:barcode', async (request, reply) => {
    const params = z.object({
      barcode: z.string().min(1)
    }).parse(request.params)

    // TODO: Implement product lookup from database

    // Mock response for now
    return {
      barcode: params.barcode,
      name: 'Sample Product',
      supplier: 'ACME Corp',
      warrantyMonths: 12
    }
  })

  // Create product
  fastify.post('/product', async (request, reply) => {
    const ProductSchema = z.object({
      barcode: z.string().min(1),
      name: z.string().min(1),
      supplier: z.string().optional(),
      warrantyMonths: z.number().int().positive().default(12)
    })

    const data = ProductSchema.parse(request.body)

    // TODO: Implement product creation with Prisma

    return {
      ok: true,
      product: data
    }
  })
}
