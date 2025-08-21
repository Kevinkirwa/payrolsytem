import AuditLog from '../models/AuditLog.js';

export async function writeAudit(req, { action, entity, entityId, metadata }) {
	try {
		await AuditLog.create({
			actor: req.user ? { id: req.user.id, role: req.user.role, email: req.user.email } : null,
			action,
			entity,
			entityId,
			metadata
		});
	} catch (e) {
		// swallow
	}
}