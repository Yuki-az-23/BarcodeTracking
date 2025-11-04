import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const ScanSchema = z.object({
  barcode: z.string().min(1),
  internalBarcode: z.string().min(1),
  userId: z.string().uuid(),
  timestamp: z.string().datetime()
})

export default async function scanRoutes(fastify: FastifyInstance) {
  // Create scan
  fastify.post('/scan', async (request, reply) => {
    const data = ScanSchema.parse(request.body)

    // TODO: Implement scan creation logic with Prisma
    // For now, just return success
    const scanId = crypto.randomUUID()

    return {
      ok: true,
      scanId,
      data
    }
  })

  // Get scans by user
  fastify.get('/scans/:userId', async (request, reply) => {
    const params = z.object({
      userId: z.string().uuid()
    }).parse(request.params)

    // TODO: Implement fetching scans from database

    return {
      ok: true,
      scans: []
    }
  })
}
