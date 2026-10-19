import express from 'express';
import { db } from '../db.js';
import { authenticateAdmin, requireRole } from '../auth.js';

const router = express.Router();

// GET AUDIT LOGS WITH SEARCH AND PAGINATION
router.get('/', authenticateAdmin, requireRole(['super_admin']), (req, res) => {
  const { search, action, entity, page = 1, limit = 40 } = req.query;

  let logs = db.getAuditLogs();

  if (action && action !== 'all') {
    logs = logs.filter((l) => l.action === action);
  }

  if (entity && entity !== 'all') {
    logs = logs.filter((l) => l.entity === entity);
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.entityId && l.entityId.toLowerCase().includes(q)) ||
        (l.details && JSON.stringify(l.details).toLowerCase().includes(q))
    );
  }

  const total = logs.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const startIndex = (p - 1) * l;
  const paginated = logs.slice(startIndex, startIndex + l);

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    logs: paginated,
  });
});

export default router;
