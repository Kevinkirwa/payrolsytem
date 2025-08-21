import PayrollRecord from '../models/PayrollRecord.js';
import Employee from '../models/Employee.js';
import TransactionLog from '../models/TransactionLog.js';
import { simulateBankTransfer, sendMpesaPayment } from '../services/paymentService.js';
import { writeAudit } from '../services/auditService.js';

async function payRecord(record) {
	const employee = await Employee.findById(record.employee);
	const amount = record.net;
	let result = null;
	if (employee?.mpesaNumber) {
		result = await sendMpesaPayment({ amount, employee, recordId: record._id });
		record.payment.method = 'mpesa';
	} else {
		result = await simulateBankTransfer({ amount, employee, recordId: record._id });
		record.payment.method = 'bank';
	}
	record.payment.status = result.status === 'success' ? 'paid' : 'failed';
	record.payment.transactions = [...(record.payment.transactions || []), { ref: result.providerRef, at: new Date() }];
	await record.save();
	await TransactionLog.create({
		record: record._id,
		employee: record.employee,
		method: record.payment.method,
		amount,
		status: result.status === 'success' ? 'success' : 'failed',
		providerRef: result.providerRef,
		meta: result.meta
	});
	return record;
}

	export async function disburseRun(req, res) {
	const { runId } = req.params;
	const run = await (await import('../models/PayrollRun.js')).default.findById(runId);
	if (!run) return res.status(404).json({ message: 'Run not found' });
	if (run.status !== 'approved') return res.status(400).json({ message: 'Run must be approved before disbursement' });
	const records = await PayrollRecord.find({ run: runId, 'payment.status': { $ne: 'paid' } });
	if (records.length === 0) return res.json({ message: 'No payable records' });
	const updated = [];
	for (const rec of records) {
		const up = await payRecord(rec);
		updated.push(up._id);
	}
	await writeAudit(req, { action: 'disburse_run', entity: 'payroll', entityId: String(runId), metadata: { count: updated.length } });
	return res.json({ message: 'Disbursement completed', count: updated.length });
}

export async function disburseRecord(req, res) {
	const { recordId } = req.params;
	const record = await PayrollRecord.findById(recordId);
	if (!record) return res.status(404).json({ message: 'Record not found' });
	await payRecord(record);
	await writeAudit(req, { action: 'disburse_record', entity: 'payroll', entityId: String(recordId) });
	return res.json({ message: 'Record disbursed', record });
}