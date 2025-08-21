import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function EmployeeDashboard() {
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get('/api/employees/me');
				setProfile(data.employee);
			} catch (e) {}
		})();
	}, []);

	function downloadPayslip() {
		const now = new Date();
		const url = `${api.defaults.baseURL}/api/payslip/${profile._id}?month=${now.getMonth()+1}&year=${now.getFullYear()}`;
		window.open(url, '_blank');
	}

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Employee Dashboard</h1>
			{profile && (
				<div className="space-y-2 bg-white dark:bg-gray-900 p-4 rounded shadow">
					<div>Name: {profile.name}</div>
					<div>Email: {profile.email}</div>
					<div>Department: {profile.department || '-'}</div>
					<div>Basic Salary: {profile.basicSalary}</div>
					<button onClick={downloadPayslip} className="bg-blue-600 text-white rounded px-3 py-2">Download Payslip (PDF)</button>
				</div>
			)}
			<div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
				<h2 className="font-medium mb-2">Leave Balances</h2>
				<div>Annual: 21 days</div>
				<div>Sick: 7 days</div>
			</div>
		</div>
	);
}