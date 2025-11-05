import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'

// Initialize Supabase client for server-side auth validation
let supabase: any = null

if (config.supabaseUrl && config.supabaseJwtSecret) {
  supabase = createClient(config.supabaseUrl, config.supabaseJwtSecret)
}

/**
 * Middleware to validate JWT token from Supabase
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Validate token with Supabase
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token)

      if (error || !data.user) {
        return reply.status(401).send({
          ok: false,
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        })
      }

      // Attach user to request
      ;(request as any).user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user'
      }
    } else {
      // Fallback: validate JWT with Fastify JWT plugin
      try {
        await request.jwtVerify()
      } catch (err) {
        return reply.status(401).send({
          ok: false,
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        })
      }
    }
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      ok: false,
      code: 'AUTH_ERROR',
      message: 'Authentication error'
    })
  }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      if (supabase) {
        const { data } = await supabase.auth.getUser(token)
        if (data.user) {
          ;(request as any).user = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.user_metadata?.role || 'user'
          }
        }
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
    request.log.debug('Optional auth failed:', error)
  }
}

/**
 * Role-based authorization
 */
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (request as any).user

    if (!user) {
      return reply.status(401).send({
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      })
    }

    if (!roles.includes(user.role)) {
      return reply.status(403).send({
        ok: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      })
    }
  }
}
