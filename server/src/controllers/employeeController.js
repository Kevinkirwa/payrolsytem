import crypto from 'crypto';
import Employee from '../models/Employee.js';
import User from '../models/User.js';

export async function listEmployees(req, res) {
	const employees = await Employee.find().sort({ createdAt: -1 });
	return res.json({ employees });
}

export async function getEmployee(req, res) {
	const { id } = req.params;
	const employee = await Employee.findById(id);
	if (!employee) return res.status(404).json({ message: 'Employee not found' });
	return res.json({ employee });
}

export async function getMyEmployee(req, res) {
	const userId = req.user?.id;
	if (!userId) return res.status(401).json({ message: 'Unauthorized' });
	const employee = await Employee.findOne({ user: userId });
	if (!employee) return res.status(404).json({ message: 'Employee profile not found' });
	return res.json({ employee });
}

export async function createEmployee(req, res) {
	const {
		name,
		email,
		phone,
		jobTitle,
		department,
		basicSalary = 0,
		allowances = [],
		deductions = [],
		bankAccount = {},
		mpesaNumber
	} = req.body;

	if (!name || !email) return res.status(400).json({ message: 'name and email are required' });

	let user = await User.findOne({ email });
	let tempPassword = null;
	if (!user) {
		tempPassword = 'Emp@' + crypto.randomBytes(3).toString('hex');
		user = new User({ name, email, role: 'employee', password: tempPassword, phone });
		await user.save();
	}

	const allowancesTotal = allowances.reduce((sum, a) => sum + (a.amount || 0), 0);
	const deductionsTotal = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);

	const employee = await Employee.create({
		user: user._id,
		name,
		email,
		phone,
		jobTitle,
		department,
		basicSalary,
		allowances,
		allowancesTotal,
		deductions,
		deductionsTotal,
		bankAccount,
		mpesaNumber
	});

	return res.status(201).json({ employee, tempPassword });
}

export async function updateEmployee(req, res) {
	const { id } = req.params;
	const updates = req.body || {};
	if (updates.allowances) {
		updates.allowancesTotal = updates.allowances.reduce((s, a) => s + (a.amount || 0), 0);
	}
	if (updates.deductions) {
		updates.deductionsTotal = updates.deductions.reduce((s, d) => s + (d.amount || 0), 0);
	}
	const employee = await Employee.findByIdAndUpdate(id, updates, { new: true });
	if (!employee) return res.status(404).json({ message: 'Employee not found' });
	return res.json({ employee });
}

export async function deleteEmployee(req, res) {
	const { id } = req.params;
	const employee = await Employee.findById(id);
	if (!employee) return res.status(404).json({ message: 'Employee not found' });
	await Employee.findByIdAndDelete(id);
	if (employee.user) {
		await User.findByIdAndUpdate(employee.user, { isActive: false });
	}
	return res.json({ message: 'Employee deleted' });
}