import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { computeMonthlySummary } from '../services/reportService.js';

export async function monthlySummary(req, res) {
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const { summary } = await computeMonthlySummary({ month, year });
	return res.json({ summary });
}

export async function monthlySummaryCsv(req, res) {
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const { summary, records } = await computeMonthlySummary({ month, year });
	const fields = ['employee','gross','paye','sha','nssf','otherDeductions','net'];
	const data = records.map(r => ({
		employee: r.employee,
		gross: r.gross,
		paye: r.paye,
		sha: r.sha,
		nssf: r.nssf,
		otherDeductions: r.otherDeductions,
		net: r.net
	}));
	const parser = new Parser({ fields });
	const csv = parser.parse(data);
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', `attachment; filename="payroll-summary-${year}-${month}.csv"`);
	return res.send(csv);
}

export async function monthlySummaryPdf(req, res) {
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const { summary } = await computeMonthlySummary({ month, year });
	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', `inline; filename="payroll-summary-${year}-${month}.pdf"`);
	const doc = new PDFDocument({ size: 'A4', margin: 50 });
	doc.pipe(res);
	doc.fontSize(18).text('Monthly Payroll Summary');
	doc.moveDown();
	doc.fontSize(12).text(`Period: ${year}-${String(month).padStart(2,'0')}`);
	doc.moveDown();
	doc.text(`Total Gross: ${summary.gross.toFixed(2)}`);
	doc.text(`PAYE: ${summary.paye.toFixed(2)}`);
	doc.text(`SHA: ${summary.sha.toFixed(2)}`);
	doc.text(`NSSF: ${summary.nssf.toFixed(2)}`);
	doc.text(`Other Deductions: ${summary.otherDeductions.toFixed(2)}`);
	doc.text(`Net Disbursed: ${summary.net.toFixed(2)}`);
	doc.end();
}