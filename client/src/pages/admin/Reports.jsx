import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function Reports() {
	const [summary, setSummary] = useState(null);

	useEffect(() => {
		(async () => {
			const now = new Date();
			const { data } = await api.get('/api/reports/monthly', { params: { month: now.getMonth()+1, year: now.getFullYear() } });
			setSummary(data.summary);
		})();
	}, []);

	const now = new Date();
	const month = now.getMonth()+1; const year = now.getFullYear();
	const base = `${api.defaults.baseURL}/api/reports`;

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Reports</h1>
			{summary && (
				<div className="bg-white dark:bg-gray-900 p-4 rounded shadow space-y-2">
					<div>Total Gross: {summary.gross.toFixed(2)}</div>
					<div>PAYE: {summary.paye.toFixed(2)}</div>
					<div>SHA: {summary.sha.toFixed(2)}</div>
					<div>NSSF: {summary.nssf.toFixed(2)}</div>
					<div>Net: {summary.net.toFixed(2)}</div>
				</div>
			)}
			<div className="flex gap-3">
				<a className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-800" href={`${base}/monthly.csv?month=${month}&year=${year}`}>Export CSV</a>
				<a className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-800" href={`${base}/monthly.pdf?month=${month}&year=${year}`} target="_blank">Open PDF</a>
			</div>
		</div>
	);
}