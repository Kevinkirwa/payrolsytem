import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
	const { user, logout } = useAuth();
	return (
		<nav className="w-full bg-white dark:bg-gray-900 shadow px-4 py-2 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<Link to="/" className="font-semibold">Payroll</Link>
				{user?.role === 'admin' && (
					<>
						<Link to="/admin">Dashboard</Link>
						<Link to="/admin/employees">Employees</Link>
						<Link to="/admin/payroll">Payroll</Link>
						<Link to="/admin/reports">Reports</Link>
						<Link to="/admin/settings">Settings</Link>
					</>
				)}
				{user?.role === 'employee' && (
					<Link to="/employee">My Portal</Link>
				)}
			</div>
			<div className="flex items-center gap-3">
				{user && <span className="text-sm opacity-80">{user.name} ({user.role})</span>}
				{user && <button onClick={logout} className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-800">Logout</button>}
			</div>
		</nav>
	);
}