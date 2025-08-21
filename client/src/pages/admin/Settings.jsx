import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function Settings() {
	const [form, setForm] = useState({ kraTokenUrl: '', submitP10Url: '', submitP10AUrl: '', submitP9Url: '', employerPin: '', branch: '' });
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState('');

	useEffect(() => { (async ()=>{
		try { const { data } = await api.get('/api/settings/kra'); setForm({ ...form, ...(data.settings||{}) }); } catch {}
	})(); }, []);

	async function save() {
		await api.put('/api/settings/kra', form);
	}

	async function test() {
		setTesting(true); setTestResult('');
		try { const { data } = await api.post('/api/settings/kra/test', { tokenUrl: form.kraTokenUrl }); setTestResult(data.ok ? 'Connection OK' : 'Failed'); } catch (e) { setTestResult('Failed: ' + (e.response?.data?.message || e.message)); } finally { setTesting(false); }
	}

	function input(name, placeholder) {
		return <input className="border rounded px-2 py-1 bg-transparent w-full" value={form[name]||''} placeholder={placeholder} onChange={e=>setForm(v=>({...v,[name]:e.target.value}))} />
	}

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<div className="bg-white dark:bg-gray-900 p-4 rounded shadow space-y-3">
				<h2 className="font-medium">KRA Integration</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{input('kraTokenUrl','KRA Token URL')}
					{input('submitP10Url','KRA Submit P10 URL')}
					{input('submitP10AUrl','KRA Submit P10A URL')}
					{input('submitP9Url','KRA Submit P9 URL')}
					{input('employerPin','Employer PIN')}
					{input('branch','Branch')}
				</div>
				<div className="flex gap-2">
					<button onClick={save} className="px-3 py-2 rounded bg-blue-600 text-white">Save</button>
					<button onClick={test} disabled={testing} className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-800">{testing ? 'Testing...' : 'Test Connection'}</button>
					{testResult && <span className="text-sm ml-2">{testResult}</span>}
				</div>
			</div>
		</div>
	);
}