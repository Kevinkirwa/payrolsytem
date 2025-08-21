import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';

export function verifyJwt(req, res, next) {
	try {
		let token = null;
		if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		} else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (!token) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
		req.user = payload;
		return next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}

export function requireRole(...allowedRoles) {
	return function roleGuard(req, res, next) {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
}

export function requirePermission(permission) {
	return function permissionGuard(req, res, next) {
		const perms = req.user?.permissions || [];
		if (req.user?.role === 'admin' && perms.includes('*')) return next();
		if (!perms.includes(permission)) return res.status(403).json({ message: 'Forbidden' });
		next();
	};
}

export async function allowSelfOrAdmin(req, res, next) {
	try {
		if (req.user?.role === 'admin') return next();
		const { employeeId } = req.params;
		if (!employeeId) return res.status(400).json({ message: 'employeeId param required' });
		const employee = await Employee.findById(employeeId);
		if (!employee) return res.status(404).json({ message: 'Employee not found' });
		if (String(employee.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });
		return next();
	} catch (e) {
		return res.status(500).json({ message: 'Access check failed' });
	}
}