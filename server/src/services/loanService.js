import Loan from '../models/Loan.js';

export async function getMonthlyLoanDeductions(employeeId) {
	const loans = await Loan.find({ employee: employeeId, status: 'active' });
	const total = loans.reduce((s, l) => s + (l.monthlyDue || 0), 0);
	return { total, loans };
}

export async function applyRepaymentForRun(employeeId) {
	const loans = await Loan.find({ employee: employeeId, status: 'active' });
	for (const loan of loans) {
		loan.balance = Math.max(0, (loan.balance || 0) - (loan.monthlyDue || 0));
		if (loan.balance <= 0) loan.status = 'closed';
		await loan.save();
	}
}