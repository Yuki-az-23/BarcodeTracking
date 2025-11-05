import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export const errorHandler = async (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const requestId = request.id

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors,
      traceId: requestId
    })
  }

  // Handle known error codes
  const statusCode = error.statusCode || 500
  const isClientError = statusCode >= 400 && statusCode < 500

  // Log error (don't log client errors as errors, just warnings)
  if (isClientError) {
    request.log.warn(error)
  } else {
    request.log.error(error)
  }

  // Send error response
  return reply.status(statusCode).send({
    ok: false,
    code: error.code || 'INTERNAL_ERROR',
    message: isClientError ? error.message : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    traceId: requestId
  })
}
