import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import PayrollRecord from '../models/PayrollRecord.js';
import Employee from '../models/Employee.js';
import { submitP10, submitP10A, submitP9 } from '../services/kraService.js';

async function getPeriodRecords(month, year) {
	const query = { periodMonth: Number(month), periodYear: Number(year) };
	return PayrollRecord.find(query).populate('employee');
}

export async function p10Csv(req, res) {
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const records = await getPeriodRecords(month, year);
	const totalPaye = records.reduce((s, r) => s + (r.paye || 0), 0);
	const fields = ['period','kraPin','employeeName','paye'];
	const rows = records.map(r => ({ period: `${year}-${String(month).padStart(2,'0')}`, kraPin: r.employee?.kraPin || '', employeeName: r.employee?.name || '', paye: r.paye }));
	rows.push({ period: `${year}-${String(month).padStart(2,'0')}`, kraPin: 'TOTAL', employeeName: '', paye: totalPaye });
	const parser = new Parser({ fields });
	const csv = parser.parse(rows);
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', `attachment; filename="P10-${year}-${month}.csv"`);
	return res.send(csv);
}

export async function p10aCsv(req, res) {
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const records = await getPeriodRecords(month, year);
	const fields = ['employeeName','gross','paye','nssf','sha','housingLevy','net'];
	const rows = records.map(r => ({ employeeName: r.employee?.name || '', gross: r.gross, paye: r.paye, nssf: r.nssf, sha: r.sha, housingLevy: r.housingLevy || 0, net: r.net }));
	const parser = new Parser({ fields });
	const csv = parser.parse(rows);
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', `attachment; filename="P10A-${year}-${month}.csv"`);
	return res.send(csv);
}

export async function p9Pdf(req, res) {
	let { month, year, employeeId } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const query = { periodMonth: month, periodYear: year };
	if (employeeId) query.employee = employeeId;
	const records = await PayrollRecord.find(query).populate('employee');
	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', `inline; filename="P9-${year}-${month}.pdf"`);
	const doc = new PDFDocument({ size: 'A4', margin: 40 });
	doc.pipe(res);
	doc.fontSize(16).text('P9 Tax Deduction Card', { align: 'center' });
	doc.moveDown();
	records.forEach(r => {
		doc.fontSize(12).text(`Employee: ${r.employee?.name || ''}`);
		doc.text(`KRA PIN: ${r.employee?.kraPin || ''}`);
		doc.text(`PAYE: ${r.paye.toFixed(2)} | Gross: ${r.gross.toFixed(2)} | NSSF: ${r.nssf.toFixed(2)} | SHA: ${r.sha.toFixed(2)} | Housing: ${(r.housingLevy||0).toFixed(2)}`);
		doc.moveDown();
	});
	doc.end();
}

export async function submitP10ToKra(req, res) {
	let { month, year } = req.body;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const records = await getPeriodRecords(month, year);
	const fields = ['period','kraPin','employeeName','paye'];
	const rows = records.map(r => ({ period: `${year}-${String(month).padStart(2,'0')}`, kraPin: r.employee?.kraPin || '', employeeName: r.employee?.name || '', paye: r.paye }));
	const parser = new Parser({ fields });
	const csv = parser.parse(rows);
	const result = await submitP10({ csvContent: csv });
	return res.json({ result });
}

export async function submitP10AToKra(req, res) {
	let { month, year } = req.body;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const records = await getPeriodRecords(month, year);
	const fields = ['employeeName','gross','paye','nssf','sha','housingLevy','net'];
	const rows = records.map(r => ({ employeeName: r.employee?.name || '', gross: r.gross, paye: r.paye, nssf: r.nssf, sha: r.sha, housingLevy: r.housingLevy || 0, net: r.net }));
	const parser = new Parser({ fields });
	const csv = parser.parse(rows);
	const result = await submitP10A({ csvContent: csv });
	return res.json({ result });
}

export async function submitP9ToKra(req, res) {
	let { month, year } = req.body;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const records = await getPeriodRecords(month, year);
	// generate pdf in-memory
	const doc = new PDFDocument({ size: 'A4', margin: 40 });
	const chunks = [];
	doc.on('data', (c) => chunks.push(c));
	doc.on('end', async () => {
		const buffer = Buffer.concat(chunks);
		const result = await submitP9({ pdfBuffer: buffer });
		return res.json({ result });
	});
	doc.fontSize(16).text('P9 Tax Deduction Card', { align: 'center' });
	doc.moveDown();
	records.forEach(r => {
		doc.fontSize(12).text(`Employee: ${r.employee?.name || ''}`);
		doc.text(`KRA PIN: ${r.employee?.kraPin || ''}`);
		doc.text(`PAYE: ${r.paye.toFixed(2)} | Gross: ${r.gross.toFixed(2)} | NSSF: ${r.nssf.toFixed(2)} | SHA: ${r.sha.toFixed(2)} | Housing: ${(r.housingLevy||0).toFixed(2)}`);
		doc.moveDown();
	});
	doc.end();
}