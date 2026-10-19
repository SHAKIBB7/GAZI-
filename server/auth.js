import crypto from 'crypto';
import { db } from './db.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'gazi_sports_admin_secure_vault_2026_dhaka';

export function createToken(payload, expiresInHours = 24) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload = { ...payload, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Express Middleware for Authenticating Admin API Routes
export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Administrative authentication token required',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired administration token',
      code: 'INVALID_TOKEN',
    });
  }

  const admin = db.getAdminByUsernameOrEmail(payload.username);
  if (!admin) {
    return res.status(401).json({
      error: 'Unauthorized: Administrator account no longer active',
      code: 'USER_NOT_FOUND',
    });
  }

  req.admin = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions,
  };

  next();
}

// Permission checking middleware
export function requireRole(allowedRoles = ['super_admin']) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.admin.role === 'super_admin' || allowedRoles.includes(req.admin.role)) {
      return next();
    }
    return res.status(403).json({
      error: 'Forbidden: Insufficient role permissions for this operation',
      code: 'PERMISSION_DENIED',
    });
  };
}
