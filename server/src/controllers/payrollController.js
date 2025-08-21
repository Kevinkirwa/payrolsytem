import moment from 'moment';
import Employee from '../models/Employee.js';
import PayrollRun from '../models/PayrollRun.js';
import PayrollRecord from '../models/PayrollRecord.js';
import { computePayrollForEmployee } from '../services/payrollService.js';
import PDFDocument from 'pdfkit';
import { writeAudit } from '../services/auditService.js';

export async function runPayrollForAll(req, res) {
	const { month, year } = req.body;
	const periodMonth = Number(month) || (new Date().getMonth() + 1);
	const periodYear = Number(year) || new Date().getFullYear();

	const employees = await Employee.find({ isActive: true });
	if (employees.length === 0) return res.status(400).json({ message: 'No active employees' });

	const run = await PayrollRun.create({ periodMonth, periodYear, status: 'completed' });

	let totals = { gross: 0, paye: 0, sha: 0, nssf: 0, otherDeductions: 0, net: 0 };
	const records = [];

	for (const emp of employees) {
		const calc = computePayrollForEmployee(emp, { month: periodMonth, year: periodYear });
		totals.gross += calc.gross;
		totals.paye += calc.paye;
		totals.sha += calc.sha;
		totals.nssf += calc.nssf;
		totals.housingLevy = (totals.housingLevy || 0) + calc.housingLevy;
		totals.otherDeductions += calc.otherDeductions;
		totals.net += calc.net;
		records.push({
			run: run._id,
			employee: emp._id,
			...calc
		});
	}

	// round totals
	for (const k of Object.keys(totals)) totals[k] = Math.round(totals[k] * 100) / 100;

	run.totals = totals;
	await run.save();
	await PayrollRecord.insertMany(records);

	await writeAudit(req, { action: 'run', entity: 'payroll', entityId: String(run._id), metadata: { periodMonth, periodYear, count: records.length } });

	return res.status(201).json({ run, totals, count: records.length });
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
	doc.fontSize(12).text(`Basic Salary: ${Number(record.gross - (record.allowances?.reduce((s,a)=>s+a.amount,0)||0)).toFixed(2)}`);
	(record.allowances || []).forEach(a => doc.text(`${a.name}: ${a.amount.toFixed(2)}`));
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