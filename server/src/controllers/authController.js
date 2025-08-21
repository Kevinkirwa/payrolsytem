import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(user) {
	return jwt.sign(
		{ id: user._id, role: user.role, name: user.name, email: user.email },
		process.env.JWT_SECRET || 'changeme',
		{ expiresIn: '7d' }
	);
}

export async function login(req, res) {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password required' });
	}
	const user = await User.findOne({ email }).select('+password');
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const ok = await user.comparePassword(password);
	if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
	const token = signToken(user);
	res.cookie('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
	return res.json({ message: 'Logged in', user: { id: user._id, name: user.name, role: user.role, email: user.email } });
}

export async function me(req, res) {
	return res.json({ user: req.user });
}

export async function logout(req, res) {
	res.clearCookie('token');
	return res.json({ message: 'Logged out' });
}

export async function seedAdmin(req, res) {
	const { email = 'admin@company.com', password = 'Admin@123', name = 'System Admin' } = req.body || {};
	let admin = await User.findOne({ email });
	if (!admin) {
		admin = new User({ email, password, name, role: 'admin' });
		await admin.save();
	}
	return res.json({ message: 'Admin ready', email, password });
}