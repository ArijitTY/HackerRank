const { v4: uuidv4 } = require('uuid');

function logAudit(db, { actorId, actorRole, action, targetType, targetId, details }) {
  try {
    db.prepare(`
      INSERT INTO audit_log (id, actor_id, actor_role, action, target_type, target_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      uuidv4(),
      actorId || null,
      actorRole || null,
      action,
      targetType || null,
      targetId || null,
      typeof details === 'object' ? JSON.stringify(details) : (details || null)
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAudit };
