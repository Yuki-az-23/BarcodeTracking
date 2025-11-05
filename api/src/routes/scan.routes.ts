import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

const ScanSchema = z.object({
  barcode: z.string().min(1),
  internalBarcode: z.string().min(1),
  userId: z.string().uuid(),
  timestamp: z.string().datetime(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional()
})

export default async function scanRoutes(fastify: FastifyInstance) {
  // Create scan
  fastify.post('/scan', async (request, reply) => {
    const data = ScanSchema.parse(request.body)

    try {
      // Find or create product
      let product = await prisma.product.findUnique({
        where: { barcode: data.barcode }
      })

      if (!product) {
        // Create new product with internal barcode
        product = await prisma.product.create({
          data: {
            barcode: data.barcode,
            name: `Product ${data.barcode}`, // Default name, can be updated later
            supplier: null,
            warrantyMonths: 12
          }
        })
      }

      // Create scan record
      const scan = await prisma.scan.create({
        data: {
          productId: product.id,
          userId: data.userId,
          timestamp: new Date(data.timestamp)
        },
        include: {
          product: true
        }
      })

      return {
        ok: true,
        scanId: scan.id,
        data: {
          ...data,
          productId: product.id,
          productName: product.name
        }
      }
    } catch (error) {
      fastify.log.error(error)
      throw new Error('Failed to create scan')
    }
  })

  // Get scans by user
  fastify.get('/scans/:userId', async (request, reply) => {
    const params = z.object({
      userId: z.string().uuid()
    }).parse(request.params)

    try {
      const scans = await prisma.scan.findMany({
        where: {
          userId: params.userId
        },
        include: {
          product: true
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 50 // Limit to last 50 scans
      })

      return {
        ok: true,
        scans: scans.map(scan => ({
          id: scan.id,
          barcode: scan.product.barcode,
          productName: scan.product.name,
          supplier: scan.product.supplier,
          timestamp: scan.timestamp.toISOString(),
          userId: scan.userId
        }))
      }
    } catch (error) {
      fastify.log.error(error)
      throw new Error('Failed to fetch scans')
    }
  })
}
