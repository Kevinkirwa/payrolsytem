import jwt from 'jsonwebtoken';

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