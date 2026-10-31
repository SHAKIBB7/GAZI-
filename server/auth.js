import crypto from 'crypto';
import { db } from './db.js';

// Retrieve and validate the JWT signing secret
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!secret) {
      throw new Error(
        'FATAL SECURITY CONFIGURATION: JWT_SECRET environment variable is required in production mode. Refusing to operate with fallback credentials.'
      );
    }
    if (
      secret === 'gazi_sports_admin_secure_vault_2026_dhaka' ||
      secret.includes('replace_with') ||
      secret.length < 32
    ) {
      throw new Error(
        'FATAL SECURITY CONFIGURATION: Insecure placeholder or short JWT_SECRET detected in production. Configure a cryptographically secure random secret of at least 32 characters.'
      );
    }
    return secret;
  }

  // Development / Test fallback
  if (!secret) {
    return 'gazi_sports_admin_dev_test_vault_2026_secret_key_32b';
  }
  return secret;
}

export function createToken(payload, expiresInHours = 24) {
  const secret = getJwtSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInHours * 3600;
  const fullPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  let secret;
  try {
    secret = getJwtSecret();
  } catch {
    return null;
  }

  // Validate header
  try {
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf-8'));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return null;
    }
  } catch {
    return null;
  }

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expSigBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expSigBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expSigBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
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
  if (!payload || !payload.username) {
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

  // Account deactivation / disabled check
  if (admin.isActive === false || admin.status === 'disabled') {
    return res.status(401).json({
      error: 'Unauthorized: Administrator account has been deactivated or disabled',
      code: 'ACCOUNT_DEACTIVATED',
    });
  }

  // Token revocation / session invalidation check
  if (
    admin.tokenVersion !== undefined &&
    payload.tokenVersion !== undefined &&
    payload.tokenVersion !== admin.tokenVersion
  ) {
    return res.status(401).json({
      error: 'Unauthorized: Session has been revoked or invalidated. Please log in again.',
      code: 'SESSION_REVOKED',
    });
  }

  req.admin = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions || [],
    tokenVersion: admin.tokenVersion || 1,
  };

  next();
}

// Permission checking middleware with default deny least privilege
export function requireRole(allowedRoles = ['super_admin']) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: 'Unauthorized: Administrative authentication required',
        code: 'AUTH_REQUIRED',
      });
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
