import moment from 'moment';
import Employee from '../models/Employee.js';
import PayrollRun from '../models/PayrollRun.js';
import PayrollRecord from '../models/PayrollRecord.js';
import { computePayrollForEmployee } from '../services/payrollService.js';

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