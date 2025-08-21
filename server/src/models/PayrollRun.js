import mongoose from 'mongoose';

const payrollRunSchema = new mongoose.Schema(
	{
		periodMonth: { type: Number, required: true }, // 1-12
		periodYear: { type: Number, required: true },
		runDate: { type: Date, default: Date.now },
		status: { type: String, enum: ['draft', 'completed'], default: 'completed' },
		totals: {
			gross: { type: Number, default: 0 },
			paye: { type: Number, default: 0 },
			sha: { type: Number, default: 0 },
			nssf: { type: Number, default: 0 },
			housingLevy: { type: Number, default: 0 },
			otherDeductions: { type: Number, default: 0 },
			net: { type: Number, default: 0 }
		}
	},
	{ timestamps: true }
);

const PayrollRun = mongoose.models.PayrollRun || mongoose.model('PayrollRun', payrollRunSchema);
export default PayrollRun;