import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get('/api/auth/me');
				setUser(data.user);
			} catch {}
			setLoading(false);
		})();
	}, []);

	async function login(email, password) {
		const { data } = await api.post('/api/auth/login', { email, password });
		setUser(data.user);
		return data.user;
	}

	async function logout() {
		await api.post('/api/auth/logout');
		setUser(null);
	}

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}