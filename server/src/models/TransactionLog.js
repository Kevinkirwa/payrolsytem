import mongoose from 'mongoose';

const transactionLogSchema = new mongoose.Schema(
	{
		record: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollRecord', index: true },
		employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true },
		method: { type: String, enum: ['bank', 'mpesa'], required: true },
		amount: { type: Number, required: true },
		status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
		providerRef: { type: String },
		meta: { type: Object }
	},
	{ timestamps: true }
);

const TransactionLog = mongoose.models.TransactionLog || mongoose.model('TransactionLog', transactionLogSchema);
export default TransactionLog;