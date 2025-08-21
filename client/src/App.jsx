import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Nav from './components/Nav.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Employees from './pages/admin/Employees.jsx';
import Payroll from './pages/admin/Payroll.jsx';
import Reports from './pages/admin/Reports.jsx';
import Settings from './pages/admin/Settings.jsx';
import EmployeeDashboard from './pages/employee/Dashboard.jsx';

function HomeRedirect() {
	const { user } = useAuth();
	if (!user) return <Navigate to="/login" replace />;
	return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
}

function Shell({ children }) {
	return (
		<div className="min-h-screen">
			<Nav />
			{children}
		</div>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<HomeRedirect />} />
					<Route path="/login" element={<Login />} />
					<Route path="/admin" element={<ProtectedRoute role="admin"><Shell><AdminDashboard /></Shell></ProtectedRoute>} />
					<Route path="/admin/employees" element={<ProtectedRoute role="admin"><Shell><Employees /></Shell></ProtectedRoute>} />
					<Route path="/admin/payroll" element={<ProtectedRoute role="admin"><Shell><Payroll /></Shell></ProtectedRoute>} />
					<Route path="/admin/reports" element={<ProtectedRoute role="admin"><Shell><Reports /></Shell></ProtectedRoute>} />
					<Route path="/admin/settings" element={<ProtectedRoute role="admin"><Shell><Settings /></Shell></ProtectedRoute>} />
					<Route path="/employee" element={<ProtectedRoute role="employee"><Shell><EmployeeDashboard /></Shell></ProtectedRoute>} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
