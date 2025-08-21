import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const hasMpesaCreds = () => {
	return Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY);
};

export async function simulateBankTransfer({ amount, employee, recordId }) {
	await new Promise((r) => setTimeout(r, 300));
	return {
		status: 'success',
		providerRef: 'BANK-' + uuidv4(),
		meta: { accountNumber: employee.bankAccount?.accountNumber || 'N/A' }
	};
}

export async function sendMpesaPayment({ amount, employee, recordId }) {
	if (!hasMpesaCreds()) {
		return {
			status: 'success',
			providerRef: 'SIM-MPESA-' + uuidv4(),
			meta: { note: 'Simulated due to missing M-Pesa credentials' }
		};
	}
	// Placeholder for real Daraja integration. In sandbox, you'd obtain token and call B2C.
	return {
		status: 'success',
		providerRef: 'MPESA-' + uuidv4(),
		meta: { note: 'Sandbox placeholder' }
	};
}