import moment from 'moment';
import Employee from '../models/Employee.js';
import PayrollRun from '../models/PayrollRun.js';
import PayrollRecord from '../models/PayrollRecord.js';
import { computePayrollForEmployee } from '../services/payrollService.js';
import PDFDocument from 'pdfkit';
import { writeAudit } from '../services/auditService.js';
import TimeEntry from '../models/TimeEntry.js';
import { getMonthlyLoanDeductions, applyRepaymentForRun } from '../services/loanService.js';

export async function preparePayroll(req, res) {
	const { month, year, prorationFactor = 1, runType = 'regular' } = req.body;
	const periodMonth = Number(month) || (new Date().getMonth() + 1);
	const periodYear = Number(year) || new Date().getFullYear();

	const employees = await Employee.find({ isActive: true });
	if (employees.length === 0) return res.status(400).json({ message: 'No active employees' });

	const run = await PayrollRun.create({ periodMonth, periodYear, status: 'prepared', prorationFactor: Number(prorationFactor) || 1, runType });

	let totals = { gross: 0, paye: 0, sha: 0, nssf: 0, housingLevy: 0, otherDeductions: 0, net: 0 };
	const records = [];

	for (const emp of employees) {
		// Overtime for period
		const start = new Date(periodYear, periodMonth - 1, 1);
		const end = new Date(periodYear, periodMonth, 0, 23, 59, 59);
		const timeEntries = await TimeEntry.find({ employee: emp._id, date: { $gte: start, $lte: end } });
		const overtimeHours = timeEntries.reduce((s, t) => s + (t.overtimeHours || 0), 0);
		const hourlyRate = (emp.basicSalary || 0) / 173; // common monthly hours benchmark
		const overtimePay = Math.round(overtimeHours * hourlyRate * 1.5 * 100) / 100;
		// Loans
		const { total: loanDue } = await getMonthlyLoanDeductions(emp._id);

		const calc = computePayrollForEmployee(emp, { month: periodMonth, year: periodYear, prorationFactor: Number(prorationFactor) || 1, overtimePay, additionalDeductions: loanDue });
		totals.gross += calc.gross;
		totals.paye += calc.paye;
		totals.sha += calc.sha;
		totals.nssf += calc.nssf;
		totals.housingLevy += calc.housingLevy;
		totals.otherDeductions += calc.otherDeductions;
		totals.net += calc.net;
		records.push({
			run: run._id,
			employee: emp._id,
			...calc
		});
	}

	for (const k of Object.keys(totals)) totals[k] = Math.round(totals[k] * 100) / 100;
	run.totals = totals;
	await run.save();
	await PayrollRecord.insertMany(records);
	await writeAudit(req, { action: 'prepare', entity: 'payroll', entityId: String(run._id), metadata: { periodMonth, periodYear, count: records.length } });
	return res.status(201).json({ run, totals, count: records.length });
}

export async function approveRun(req, res) {
	const { runId } = req.params;
	const run = await PayrollRun.findById(runId);
	if (!run) return res.status(404).json({ message: 'Run not found' });
	if (run.status !== 'prepared') return res.status(400).json({ message: 'Only prepared runs can be approved' });
	run.status = 'approved';
	await run.save();
	await writeAudit(req, { action: 'approve', entity: 'payroll', entityId: String(run._id) });
	const { notifyApproval } = await import('../services/notifyService.js');
	await notifyApproval(run);
	return res.json({ message: 'Run approved', run });
}

export async function runPayrollForAll(req, res) {
	// Deprecated in favor of preparePayroll; keep as alias to prepare
	return preparePayroll(req, res);
}

export async function listRuns(req, res) {
	const runs = await PayrollRun.find().sort({ createdAt: -1 });
	return res.json({ runs });
}

export async function getRun(req, res) {
	const { id } = req.params;
	const run = await PayrollRun.findById(id);
	if (!run) return res.status(404).json({ message: 'Run not found' });
	const records = await PayrollRecord.find({ run: id }).populate('employee');
	return res.json({ run, records });
}

export async function listRecords(req, res) {
	const { employeeId, month, year } = req.query;
	const query = {};
	if (employeeId) query.employee = employeeId;
	if (month) query.periodMonth = Number(month);
	if (year) query.periodYear = Number(year);
	const records = await PayrollRecord.find(query).sort({ createdAt: -1 });
	return res.json({ records });
}

export async function getPayslipJson(req, res) {
	const { employeeId } = req.params;
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const record = await PayrollRecord.findOne({ employee: employeeId, periodMonth: month, periodYear: year })
		.populate('employee');
	if (!record) return res.status(404).json({ message: 'Payslip not found for period' });
	const company = { name: process.env.COMPANY_NAME || 'Company', logoUrl: process.env.COMPANY_LOGO_URL || '' };
	return res.json({ company, payslip: record });
}

export async function getPayslipPdf(req, res) {
	const { employeeId } = req.params;
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const record = await PayrollRecord.findOne({ employee: employeeId, periodMonth: month, periodYear: year })
		.populate('employee');
	if (!record) return res.status(404).json({ message: 'Payslip not found for period' });
	const companyName = process.env.COMPANY_NAME || 'Company';
	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', `inline; filename="payslip-${record.employee.name}-${year}-${month}.pdf"`);
	const doc = new PDFDocument({ size: 'A4', margin: 50 });
	doc.pipe(res);
	// Header
	doc.fontSize(18).text(companyName, { align: 'left' });
	if (process.env.COMPANY_LOGO_URL) {
		// Optionally, download the image is complex; skip external fetch and just show text placeholder
		doc.fontSize(10).text(' ', { continued: false });
	}
	doc.moveDown();
	doc.fontSize(14).text(`Payslip for ${record.periodYear}-${String(record.periodMonth).padStart(2, '0')}`);
	doc.moveDown();
	// Employee details
	doc.fontSize(12).text(`Employee: ${record.employee.name}`);
	doc.text(`Email: ${record.employee.email}`);
	doc.text(`Department: ${record.employee.department || '-'}`);
	doc.moveDown();
	// Salary breakdown
	doc.fontSize(13).text('Earnings');
	doc.fontSize(12).text(`Basic Salary: ${Number(record.gross - (record.allowances?.reduce((s,a)=>s+a.amount,0)||0) - (record.breakdown?.overtimePay||0)).toFixed(2)}`);
	(record.allowances || []).forEach(a => doc.text(`${a.name}: ${a.amount.toFixed(2)}`));
	if (record.breakdown?.overtimePay) doc.text(`Overtime: ${Number(record.breakdown.overtimePay).toFixed(2)}`);
	doc.text(`Gross Pay: ${record.gross.toFixed(2)}`);
	doc.moveDown();
	doc.fontSize(13).text('Deductions');
	doc.fontSize(12).text(`PAYE: ${record.paye.toFixed(2)}`);
	doc.text(`SHA: ${record.sha.toFixed(2)}`);
	doc.text(`NSSF: ${record.nssf.toFixed(2)}`);
	doc.text(`Housing Levy: ${record.housingLevy.toFixed(2)}`);
	(record.deductions || []).forEach(d => doc.text(`${d.name}: ${d.amount.toFixed(2)}`));
	doc.text(`Other Deductions: ${record.otherDeductions.toFixed(2)}`);
	doc.moveDown();
	doc.fontSize(14).text(`Net Pay: ${record.net.toFixed(2)}`);
	doc.end();
}