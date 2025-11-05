import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

export default async function productRoutes(fastify: FastifyInstance) {
  // Get product by barcode
  fastify.get('/product/:barcode', async (request, reply) => {
    const params = z.object({
      barcode: z.string().min(1)
    }).parse(request.params)

    try {
      const product = await prisma.product.findUnique({
        where: {
          barcode: params.barcode
        },
        include: {
          scans: {
            take: 1,
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      })

      if (!product) {
        return reply.status(404).send({
          ok: false,
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        })
      }

      return {
        barcode: product.barcode,
        name: product.name,
        supplier: product.supplier || 'Unknown',
        warrantyMonths: product.warrantyMonths,
        lastScanned: product.scans[0]?.timestamp?.toISOString() || null
      }
    } catch (error) {
      fastify.log.error(error)
      throw new Error('Failed to fetch product')
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

    try {
      // Check if product already exists
      const existing = await prisma.product.findUnique({
        where: { barcode: data.barcode }
      })

      if (existing) {
        return reply.status(409).send({
          ok: false,
          code: 'PRODUCT_EXISTS',
          message: 'Product with this barcode already exists'
        })
      }

      const product = await prisma.product.create({
        data: {
          barcode: data.barcode,
          name: data.name,
          supplier: data.supplier || null,
          warrantyMonths: data.warrantyMonths
        }
      })

      return {
        ok: true,
        product: {
          id: product.id,
          barcode: product.barcode,
          name: product.name,
          supplier: product.supplier,
          warrantyMonths: product.warrantyMonths
        }
      }
    } catch (error) {
      fastify.log.error(error)
      throw new Error('Failed to create product')
    }
  })

  // Update product
  fastify.patch('/product/:barcode', async (request, reply) => {
    const params = z.object({
      barcode: z.string().min(1)
    }).parse(request.params)

    const UpdateSchema = z.object({
      name: z.string().min(1).optional(),
      supplier: z.string().optional(),
      warrantyMonths: z.number().int().positive().optional()
    })

    const data = UpdateSchema.parse(request.body)

    try {
      const product = await prisma.product.update({
        where: { barcode: params.barcode },
        data
      })

      return {
        ok: true,
        product: {
          id: product.id,
          barcode: product.barcode,
          name: product.name,
          supplier: product.supplier,
          warrantyMonths: product.warrantyMonths
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(404).send({
        ok: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found'
      })
    }
  })
}
