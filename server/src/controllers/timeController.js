import TimeEntry from '../models/TimeEntry.js';

export async function upsertTimeEntry(req, res) {
	const { employee, date, hours = 0, overtimeHours = 0 } = req.body;
	if (!employee || !date) return res.status(400).json({ message: 'employee and date required' });
	const found = await TimeEntry.findOne({ employee, date: new Date(date) });
	if (found) {
		found.hours = Number(hours || 0);
		found.overtimeHours = Number(overtimeHours || 0);
		await found.save();
		return res.json({ entry: found });
	}
	const entry = await TimeEntry.create({ employee, date: new Date(date), hours: Number(hours || 0), overtimeHours: Number(overtimeHours || 0) });
	return res.status(201).json({ entry });
}

export async function listTimeEntries(req, res) {
	const { employee, month, year } = req.query;
	const query = {};
	if (employee) query.employee = employee;
	if (month && year) {
		const m = Number(month); const y = Number(year);
		query.date = { $gte: new Date(y, m - 1, 1), $lte: new Date(y, m, 0, 23, 59, 59) };
	}
	const entries = await TimeEntry.find(query).sort({ date: -1 });
	return res.json({ entries });
}

export async function myTimeEntries(req, res) {
	const { month, year } = req.query;
	const y = Number(year) || new Date().getFullYear();
	const m = Number(month) || new Date().getMonth() + 1;
	const entries = await TimeEntry.find({ employee: req.user.employeeId, date: { $gte: new Date(y, m - 1, 1), $lte: new Date(y, m, 0, 23, 59, 59) } }).sort({ date: -1 });
	return res.json({ entries });
}