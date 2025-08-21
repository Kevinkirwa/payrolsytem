import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
	const { login } = useAuth();
	const [email, setEmail] = useState('admin@company.com');
	const [password, setPassword] = useState('Admin@123');
	const [error, setError] = useState('');

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		try {
			await login(email, password);
		} catch (e) {
			setError('Invalid credentials');
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-6">
			<form onSubmit={onSubmit} className="w-full max-w-sm bg-white dark:bg-gray-900 shadow rounded p-6 space-y-4">
				<h1 className="text-xl font-semibold">Sign in</h1>
				{error && <div className="text-red-500 text-sm">{error}</div>}
				<input className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
				<input className="w-full border rounded px-3 py-2 bg-transparent" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
				<button className="w-full bg-blue-600 text-white rounded px-3 py-2">Login</button>
			</form>
		</div>
	);
}