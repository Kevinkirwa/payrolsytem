import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function Payroll() {
	const [runs, setRuns] = useState([]);
	const [running, setRunning] = useState(false);

	async function load() {
		const { data } = await api.get('/api/payroll/runs');
		setRuns(data.runs);
	}

	useEffect(() => { load(); }, []);

	async function runNow() {
		setRunning(true);
		try {
			const now = new Date();
			await api.post('/api/payroll/run', { month: now.getMonth()+1, year: now.getFullYear() });
			await load();
		} finally { setRunning(false); }
	}

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Payroll</h1>
			<button onClick={runNow} disabled={running} className="bg-green-600 text-white px-3 py-2 rounded">{running ? 'Running...' : 'Run Payroll for Current Month'}</button>
			<div className="bg-white dark:bg-gray-900 rounded shadow divide-y">
				{runs.map(r => (
					<div key={r._id} className="p-3">
						<div className="font-medium">{r.periodYear}-{String(r.periodMonth).padStart(2,'0')}</div>
						<div className="text-sm opacity-80">Gross {r.totals?.gross?.toFixed?.(2)} • Net {r.totals?.net?.toFixed?.(2)}</div>
					</div>
				))}
			</div>
		</div>
	);
}