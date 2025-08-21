import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
	{
		employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true },
		type: { type: String, enum: ['loan','advance'], default: 'loan' },
		principal: { type: Number, required: true },
		interestRate: { type: Number, default: 0 }, // monthly rate
		termMonths: { type: Number, default: 12 },
		monthlyDue: { type: Number, required: true },
		balance: { type: Number, required: true },
		status: { type: String, enum: ['active','closed'], default: 'active' }
	},
	{ timestamps: true }
);

const Loan = mongoose.models.Loan || mongoose.model('Loan', loanSchema);
export default Loan;