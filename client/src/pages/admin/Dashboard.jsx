import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
	const [summary, setSummary] = useState(null);

	useEffect(() => {
		(async () => {
			try {
				const now = new Date();
				const { data } = await api.get('/api/reports/monthly', { params: { month: now.getMonth()+1, year: now.getFullYear() } });
				setSummary(data.summary);
			} catch (e) {}
		})();
	}, []);

	const chartData = summary ? [
		{ name: 'Gross', value: summary.gross },
		{ name: 'Deductions', value: summary.paye + summary.sha + summary.nssf + (summary.housingLevy||0) + summary.otherDeductions },
		{ name: 'Net', value: summary.net }
	] : [];

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Admin Dashboard</h1>
			{summary && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="p-4 rounded bg-white dark:bg-gray-900 shadow">Total Gross: {summary.gross.toFixed(2)}</div>
					<div className="p-4 rounded bg-white dark:bg-gray-900 shadow">Total Deductions: {(summary.paye + summary.sha + summary.nssf + (summary.housingLevy||0) + summary.otherDeductions).toFixed(2)}</div>
					<div className="p-4 rounded bg-white dark:bg-gray-900 shadow">Net Disbursed: {summary.net.toFixed(2)}</div>
				</div>
			)}
			<div className="h-64 bg-white dark:bg-gray-900 rounded shadow p-4">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={chartData}>
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
						<Area type="monotone" dataKey="value" stroke="#2563eb" fill="#93c5fd" />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}