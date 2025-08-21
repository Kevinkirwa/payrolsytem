import Loan from '../models/Loan.js';

export async function listLoans(req, res) {
	const { employee } = req.query;
	const q = employee ? { employee } : {};
	const loans = await Loan.find(q).sort({ createdAt: -1 });
	return res.json({ loans });
}

export async function createLoan(req, res) {
	const { employee, type = 'loan', principal, interestRate = 0, termMonths = 12, monthlyDue } = req.body;
	if (!employee || !principal || !monthlyDue) return res.status(400).json({ message: 'employee, principal, monthlyDue required' });
	const loan = await Loan.create({ employee, type, principal, interestRate, termMonths, monthlyDue, balance: principal });
	return res.status(201).json({ loan });
}

export async function updateLoan(req, res) {
	const { id } = req.params;
	const updates = req.body || {};
	const loan = await Loan.findByIdAndUpdate(id, updates, { new: true });
	if (!loan) return res.status(404).json({ message: 'Loan not found' });
	return res.json({ loan });
}

export async function closeLoan(req, res) {
	const { id } = req.params;
	const loan = await Loan.findById(id);
	if (!loan) return res.status(404).json({ message: 'Loan not found' });
	loan.status = 'closed';
	loan.balance = 0;
	await loan.save();
	return res.json({ loan });
}