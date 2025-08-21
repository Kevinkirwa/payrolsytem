import { Parser } from 'json2csv';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { parse } from 'csv-parse/sync';

export async function exportEmployeesCsv(req, res) {
	const employees = await Employee.find();
	const fields = ['name','email','phone','department','jobTitle','kraPin','basicSalary','mpesaNumber'];
	const rows = employees.map(e => ({ name: e.name, email: e.email, phone: e.phone || '', department: e.department || '', jobTitle: e.jobTitle || '', kraPin: e.kraPin || '', basicSalary: e.basicSalary || 0, mpesaNumber: e.mpesaNumber || '' }));
	const parser = new Parser({ fields });
	const csv = parser.parse(rows);
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
	return res.send(csv);
}

export async function importEmployeesCsv(req, res) {
	const { csv } = req.body; // accept CSV as text in JSON body
	if (!csv) return res.status(400).json({ message: 'csv body required' });
	const records = parse(csv, { columns: true, skip_empty_lines: true });
	let created = 0;
	for (const r of records) {
		const email = String(r.email || '').toLowerCase();
		if (!email) continue;
		let user = await User.findOne({ email });
		if (!user) {
			const tempPassword = 'Emp@' + crypto.randomBytes(3).toString('hex');
			user = new User({ name: r.name, email, role: 'employee', password: tempPassword, phone: r.phone || '' });
			await user.save();
		}
		const existing = await Employee.findOne({ email });
		if (existing) continue;
		await Employee.create({
			user: user._id,
			name: r.name,
			email,
			phone: r.phone || '',
			department: r.department || '',
			jobTitle: r.jobTitle || '',
			kraPin: r.kraPin || '',
			basicSalary: Number(r.basicSalary || 0),
			mpesaNumber: r.mpesaNumber || ''
		});
		created++;
	}
	return res.json({ created });
}