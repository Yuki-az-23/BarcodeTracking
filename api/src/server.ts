import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { config } from './config.js'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/error.middleware.js'

// Import routes
import healthRoutes from './routes/health.routes.js'
import scanRoutes from './routes/scan.routes.js'
import productRoutes from './routes/product.routes.js'

const fastify = Fastify({
  logger: logger,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  genReqId: () => crypto.randomUUID()
})

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: false
})

await fastify.register(cors, {
  origin: config.allowedOrigins,
  credentials: true
})

await fastify.register(jwt, {
  secret: config.jwtSecret
})

// Register error handler
fastify.setErrorHandler(errorHandler)

// Register routes
await fastify.register(healthRoutes, { prefix: '/api/v1' })
await fastify.register(scanRoutes, { prefix: '/api/v1' })
await fastify.register(productRoutes, { prefix: '/api/v1' })

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: config.port,
      host: config.host
    })

    console.log(`🚀 Server listening on http://${config.host}:${config.port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
