import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminTokenPayload {
  id: string
  email: string
  role: string
}

export interface UserTokenPayload {
  userId: string
  email?: string
  phone?: string
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload
    
    if (decoded.role !== 'admin') {
      throw new Error('Not authorized as admin')
    }
    
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function getTokenFromRequest(request: Request): string {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }
  
  return authHeader.substring(7)
}

export function verifyAdminFromRequest(request: Request): AdminTokenPayload | null {
  try {
    const token = getTokenFromRequest(request)
    return verifyAdminToken(token)
  } catch (error) {
    return null
  }
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    // Handle both 'id' and 'userId' field names for backwards compatibility
    return {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      phone: decoded.phone
    }
  } catch (error) {
    return null
  }
}
