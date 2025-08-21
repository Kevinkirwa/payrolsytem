import axios from 'axios';

async function getToken(tokenUrlOverride) {
	const tokenUrl = tokenUrlOverride || process.env.KRA_TOKEN_URL || '';
	const clientId = process.env.KRA_CLIENT_ID || '';
	const clientSecret = process.env.KRA_CLIENT_SECRET || '';
	if (!tokenUrl || !clientId || !clientSecret) throw new Error('KRA credentials or token URL not configured');
	const { data } = await axios.post(tokenUrl, { client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' });
	return data.access_token;
}

export async function submitP10({ csvContent }) {
	const url = process.env.KRA_SUBMIT_P10_URL || '';
	if (!url) throw new Error('KRA_SUBMIT_P10_URL not configured');
	const token = await getToken();
	const { data } = await axios.post(url, { file: Buffer.from(csvContent).toString('base64') }, { headers: { Authorization: `Bearer ${token}` } });
	return data;
}

export async function submitP10A({ csvContent }) {
	const url = process.env.KRA_SUBMIT_P10A_URL || '';
	if (!url) throw new Error('KRA_SUBMIT_P10A_URL not configured');
	const token = await getToken();
	const { data } = await axios.post(url, { file: Buffer.from(csvContent).toString('base64') }, { headers: { Authorization: `Bearer ${token}` } });
	return data;
}

export async function submitP9({ pdfBuffer }) {
	const url = process.env.KRA_SUBMIT_P9_URL || '';
	if (!url) throw new Error('KRA_SUBMIT_P9_URL not configured');
	const token = await getToken();
	const { data } = await axios.post(url, { file: pdfBuffer.toString('base64') }, { headers: { Authorization: `Bearer ${token}` } });
	return data;
}

export async function testKraToken(tokenUrl) {
	const token = await getToken(tokenUrl);
	return Boolean(token);
}