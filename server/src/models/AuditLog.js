import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
	{
		actor: { type: Object }, // { id, role, email }
		action: { type: String, required: true },
		entity: { type: String, required: true },
		entityId: { type: String },
		metadata: { type: Object }
	},
	{ timestamps: true }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;