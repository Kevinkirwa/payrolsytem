import { Parser } from 'json2csv';
import PayrollRecord from '../models/PayrollRecord.js';

export async function glExportCsv(req, res) {
	let { month, year } = req.query;
	month = Number(month) || (new Date().getMonth() + 1);
	year = Number(year) || new Date().getFullYear();
	const records = await PayrollRecord.find({ periodMonth: month, periodYear: year }).populate('employee');
	const fields = ['account','costCenter','description','debit','credit'];
	const rows = [];
	for (const r of records) {
		rows.push({ account: '5000', costCenter: r.employee?.department || 'GENERAL', description: `Gross ${r.employee?.name}`, debit: r.gross, credit: 0 });
		rows.push({ account: '2100', costCenter: r.employee?.department || 'GENERAL', description: `PAYE ${r.employee?.name}`, debit: 0, credit: r.paye });
		rows.push({ account: '2110', costCenter: r.employee?.department || 'GENERAL', description: `NSSF ${r.employee?.name}`, debit: 0, credit: r.nssf });
		rows.push({ account: '2115', costCenter: r.employee?.department || 'GENERAL', description: `SHA ${r.employee?.name}`, debit: 0, credit: r.sha });
		rows.push({ account: '2120', costCenter: r.employee?.department || 'GENERAL', description: `Housing Levy ${r.employee?.name}`, debit: 0, credit: r.housingLevy || 0 });
		rows.push({ account: '1010', costCenter: r.employee?.department || 'GENERAL', description: `Net Pay ${r.employee?.name}`, debit: 0, credit: r.net });
	}
	const parser = new Parser({ fields });
	const csv = parser.parse(rows);
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', `attachment; filename="GL-${year}-${month}.csv"`);
	return res.send(csv);
}