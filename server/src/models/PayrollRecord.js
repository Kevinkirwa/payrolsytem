import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema(
	{ name: String, amount: Number },
	{ _id: false }
);

const payrollRecordSchema = new mongoose.Schema(
	{
		run: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollRun', index: true },
		employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true },
		periodMonth: { type: Number, required: true },
		periodYear: { type: Number, required: true },
		gross: { type: Number, required: true },
		paye: { type: Number, required: true },
		sha: { type: Number, required: true },
		nssf: { type: Number, required: true },
		housingLevy: { type: Number, required: true },
		otherDeductions: { type: Number, default: 0 },
		net: { type: Number, required: true },
		allowances: { type: [componentSchema], default: [] },
		deductions: { type: [componentSchema], default: [] },
		breakdown: { type: Object },
		payment: {
			status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
			method: { type: String, enum: ['bank', 'mpesa', 'none'], default: 'none' },
			transactions: { type: Array, default: [] }
		}
	},
	{ timestamps: true }
);

const PayrollRecord = mongoose.models.PayrollRecord || mongoose.model('PayrollRecord', payrollRecordSchema);
export default PayrollRecord;