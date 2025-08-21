import PayrollRecord from '../models/PayrollRecord.js';

export async function computeMonthlySummary({ month, year }) {
	const query = { periodMonth: Number(month), periodYear: Number(year) };
	const records = await PayrollRecord.find(query);
	const summary = {
		month: Number(month),
		year: Number(year),
		gross: 0,
		paye: 0,
		sha: 0,
		nssf: 0,
		housingLevy: 0,
		otherDeductions: 0,
		net: 0,
		count: records.length
	};
	records.forEach(r => {
		summary.gross += r.gross;
		summary.paye += r.paye;
		summary.sha += r.sha;
		summary.nssf += r.nssf;
		summary.housingLevy += r.housingLevy || 0;
		summary.otherDeductions += r.otherDeductions;
		summary.net += r.net;
	});
	for (const k of ['gross','paye','sha','nssf','housingLevy','otherDeductions','net']) {
		summary[k] = Math.round(summary[k] * 100) / 100;
	}
	return { summary, records };
}