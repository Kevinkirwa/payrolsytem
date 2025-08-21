import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function Employees() {
	const [employees, setEmployees] = useState([]);
	const [form, setForm] = useState({ name: '', email: '', basicSalary: 0, department: '' });
	const [loading, setLoading] = useState(false);

	async function load() {
		const { data } = await api.get('/api/employees');
		setEmployees(data.employees);
	}

	useEffect(() => { load(); }, []);

	async function onCreate(e) {
		e.preventDefault();
		setLoading(true);
		try {
			await api.post('/api/employees', { ...form, basicSalary: Number(form.basicSalary) });
			setForm({ name: '', email: '', basicSalary: 0, department: '' });
			await load();
		} finally { setLoading(false); }
	}

	async function onDelete(id) {
		await api.delete(`/api/employees/${id}`);
		await load();
	}

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Employees</h1>
			<form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-white dark:bg-gray-900 p-4 rounded shadow">
				<input className="border rounded px-2 py-1 bg-transparent" placeholder="Name" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} />
				<input className="border rounded px-2 py-1 bg-transparent" placeholder="Email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} />
				<input className="border rounded px-2 py-1 bg-transparent" placeholder="Department" value={form.department} onChange={e=>setForm(v=>({...v,department:e.target.value}))} />
				<input className="border rounded px-2 py-1 bg-transparent" placeholder="Basic Salary" type="number" value={form.basicSalary} onChange={e=>setForm(v=>({...v,basicSalary:e.target.value}))} />
				<button disabled={loading} className="bg-blue-600 text-white rounded px-3 py-1">Add</button>
			</form>
			<div className="bg-white dark:bg-gray-900 rounded shadow divide-y">
				{employees.map(e => (
					<div key={e._id} className="p-3 flex items-center justify-between">
						<div>
							<div className="font-medium">{e.name}</div>
							<div className="text-sm opacity-80">{e.email} • {e.department || '-'} • KES {e.basicSalary}</div>
						</div>
						<button onClick={()=>onDelete(e._id)} className="text-sm px-3 py-1 bg-red-600 text-white rounded">Delete</button>
					</div>
				))}
			</div>
		</div>
	);
}