import express from 'express';
import { db, verifyPassword } from '../db.js';
import { createToken, authenticateAdmin, requireRole } from '../auth.js';

const router = express.Router();

// 1. Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const admin = db.getAdminByUsernameOrEmail(username);
  if (!admin) {
    console.warn(`[AUTH] Login attempt failed: identifier not found from IP ${req.ip}`);
    await db.addAuditLog({
      actor: username,
      role: 'anonymous',
      action: 'LOGIN_FAILED',
      entity: 'auth',
      entityId: username,
      details: { reason: 'User not found', ip: req.ip },
      ip: req.ip,
    });
    return res.status(401).json({ error: 'Invalid username/email or password' });
  }

  // Deactivated/Disabled Account Check
  if (admin.isActive === false || admin.status === 'disabled') {
    console.warn(`[AUTH] Login blocked: account deactivated for username=${admin.username} from IP ${req.ip}`);
    await db.addAuditLog({
      actor: admin.username,
      role: admin.role,
      action: 'LOGIN_BLOCKED_DEACTIVATED',
      entity: 'auth',
      entityId: admin.id,
      details: { reason: 'Account has been deactivated', ip: req.ip },
      ip: req.ip,
    });
    return res.status(403).json({
      error: 'This administrator account has been deactivated. Please contact the Super Admin.',
    });
  }

  const isValid = verifyPassword(password, admin.salt, admin.passwordHash);
  if (!isValid) {
    console.warn(`[AUTH] Login attempt failed: incorrect password for username=${admin.username} from IP ${req.ip}`);
    await db.addAuditLog({
      actor: admin.username,
      role: admin.role,
      action: 'LOGIN_FAILED',
      entity: 'auth',
      entityId: admin.id,
      details: { reason: 'Incorrect password', ip: req.ip },
      ip: req.ip,
    });
    return res.status(401).json({ error: 'Invalid username/email or password' });
  }

  console.log(`[AUTH] Login SUCCESS: username=${admin.username}, role=${admin.role} from IP ${req.ip}`);

  // Generate token valid for 24 hours with tokenVersion tracking
  const token = createToken({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    tokenVersion: admin.tokenVersion || 1,
  });

  await db.addAuditLog({
    actor: admin.username,
    role: admin.role,
    action: 'LOGIN_SUCCESS',
    entity: 'auth',
    entityId: admin.id,
    details: { message: 'Successful admin login from web console' },
    ip: req.ip,
  });

  res.json({
    success: true,
    message: 'Welcome to Gazi Sports Administrative Portal',
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions || [],
      isActive: admin.isActive !== false,
    },
  });
});

// 2. Get Current Authenticated Admin
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({
    authenticated: true,
    user: req.admin,
  });
});

// 3. Admin Logout (Session Invalidation)
router.post('/logout', authenticateAdmin, async (req, res) => {
  // Invalidate active session server-side
  await db.invalidateAdminSession(req.admin.username, req.admin.username);

  await db.addAuditLog({
    actor: req.admin.username,
    role: req.admin.role,
    action: 'LOGOUT',
    entity: 'auth',
    entityId: req.admin.id,
    details: { message: 'Admin logged out and session token invalidated' },
    ip: req.ip,
  });

  res.json({ success: true, message: 'Logged out successfully. Session invalidated.' });
});

// 4. Change Current Admin Password
router.post('/change-password', authenticateAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  const success = await db.changeAdminPassword(req.admin.username, currentPassword, newPassword);
  if (!success) {
    return res.status(400).json({ error: 'Incorrect current password or account not found' });
  }

  res.json({ success: true, message: 'Administrative password updated successfully' });
});

// -------------------------------------------------------------
// 5. SECURE FIRST-TIME SUPER ADMIN BOOTSTRAP
// -------------------------------------------------------------
router.post('/bootstrap', async (req, res) => {
  try {
    const configuredSetupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!configuredSetupToken || configuredSetupToken.length < 16) {
      return res.status(503).json({
        error: 'Bootstrap unavailable: ADMIN_SETUP_TOKEN is not configured on the server. Please set a secure setup token in environment variables.',
      });
    }

    const providedToken = req.headers['x-admin-setup-token'] || req.body.setupToken;
    if (!providedToken || providedToken !== configuredSetupToken) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing administrator setup token.',
      });
    }

    const { username, email, name, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required for Super Admin initialization.',
      });
    }

    const createdAdmin = await db.bootstrapSuperAdmin({ username, email, name, password });

    res.status(201).json({
      success: true,
      message: 'Initial Super Admin account successfully bootstrapped. You may now log in.',
      user: createdAdmin,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. SUPER ADMIN: USER MANAGEMENT (STORE MANAGERS & ADMINS)
// -------------------------------------------------------------

// List all administrator accounts (Sanitized, never exposes hashes or salts)
router.get('/users', authenticateAdmin, requireRole(['super_admin']), (req, res) => {
  const admins = db.getAdmins();
  const sanitized = admins.map((a) => ({
    id: a.id,
    username: a.username,
    email: a.email,
    name: a.name,
    role: a.role,
    permissions: a.permissions || [],
    isActive: a.isActive !== false,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
  res.json({ total: sanitized.length, users: sanitized });
});

// Create a new Store Manager or Administrator
router.post('/users', authenticateAdmin, requireRole(['super_admin']), async (req, res) => {
  try {
    const { username, email, name, role = 'inventory_manager', permissions, password } = req.body;
    const created = await db.createAdminUser(
      { username, email, name, role, permissions, password },
      req.admin.username
    );

    res.status(201).json({
      success: true,
      message: `Administrator account '${created.username}' created with role '${created.role}'.`,
      user: created,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an administrator account (role, active status, contact details)
router.patch('/users/:id', authenticateAdmin, requireRole(['super_admin']), async (req, res) => {
  try {
    const updated = await db.updateAdminUser(req.params.id, req.body, req.admin.username);
    res.json({
      success: true,
      message: `Account '${updated.username}' updated successfully.`,
      user: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Super Admin password reset for a Store Manager
router.post('/users/:id/reset-password', authenticateAdmin, requireRole(['super_admin']), async (req, res) => {
  try {
    const { newPassword } = req.body;
    await db.resetAdminPassword(req.params.id, newPassword, req.admin.username);
    res.json({
      success: true,
      message: 'Password reset successfully. Any existing active sessions for this user have been revoked.',
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
