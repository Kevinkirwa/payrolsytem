import mongoose from 'mongoose';

const allowanceSchema = new mongoose.Schema(
	{
		name: { type: String },
		amount: { type: Number, default: 0 }
	},
	{ _id: false }
);

const deductionSchema = new mongoose.Schema(
	{
		name: { type: String },
		amount: { type: Number, default: 0 }
	},
	{ _id: false }
);

const bankAccountSchema = new mongoose.Schema(
	{
		bankName: { type: String },
		accountName: { type: String },
		accountNumber: { type: String },
		branchCode: { type: String }
	},
	{ _id: false }
);

const employeeSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		name: { type: String, required: true },
		email: { type: String, required: true, lowercase: true, index: true },
		phone: { type: String },
		jobTitle: { type: String },
		department: { type: String },
		basicSalary: { type: Number, required: true, default: 0 },
		allowancesTotal: { type: Number, default: 0 },
		allowances: { type: [allowanceSchema], default: [] },
		deductionsTotal: { type: Number, default: 0 },
		deductions: { type: [deductionSchema], default: [] },
		bankAccount: { type: bankAccountSchema },
		mpesaNumber: { type: String },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;