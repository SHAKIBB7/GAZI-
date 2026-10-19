import express from 'express';
import { db, verifyPassword } from '../db.js';
import { createToken, authenticateAdmin } from '../auth.js';

const router = express.Router();

// 1. Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const admin = db.getAdminByUsernameOrEmail(username);
  if (!admin) {
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

  const isValid = verifyPassword(password, admin.salt, admin.passwordHash);
  if (!isValid) {
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

  // Generate token valid for 24 hours
  const token = createToken({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
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
      permissions: admin.permissions,
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

// 3. Admin Logout
router.post('/logout', authenticateAdmin, async (req, res) => {
  await db.addAuditLog({
    actor: req.admin.username,
    role: req.admin.role,
    action: 'LOGOUT',
    entity: 'auth',
    entityId: req.admin.id,
    details: { message: 'Admin logged out' },
    ip: req.ip,
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
