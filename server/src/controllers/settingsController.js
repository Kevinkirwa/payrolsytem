import Settings from '../models/Settings.js';
import { testKraToken } from '../services/kraService.js';

export async function getKraSettings(req, res) {
	const s = await Settings.findOne();
	return res.json({ settings: s || {} });
}

export async function updateKraSettings(req, res) {
	const updates = req.body || {};
	let s = await Settings.findOne();
	if (!s) s = new Settings({});
	Object.assign(s, updates);
	await s.save();
	return res.json({ settings: s });
}

export async function testKraConnection(req, res) {
	const { tokenUrl } = req.body || {};
	let url = tokenUrl;
	if (!url) {
		const s = await Settings.findOne();
		url = s?.kraTokenUrl || process.env.KRA_TOKEN_URL;
	}
	try {
		const ok = await testKraToken(url);
		return res.json({ ok: Boolean(ok) });
	} catch (e) {
		return res.status(400).json({ ok: false, message: e.message });
	}
}