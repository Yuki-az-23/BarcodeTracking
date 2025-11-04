export interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}
