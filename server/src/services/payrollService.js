const PERSONAL_RELIEF = Number(process.env.KENYA_PERSONAL_RELIEF ?? 2400);
const SHA_RATE = Number(process.env.KENYA_SHA_RATE ?? 0.0275); // 2.75%
const HOUSING_LEVY_RATE = Number(process.env.KENYA_HOUSING_LEVY_RATE ?? 0.015); // 1.5%

// Monthly PAYE bands (Finance Act 2023+ approximation)
const DEFAULT_TAX_BANDS = [
	{ upTo: 24000, rate: 0.10 },
	{ upTo: 32333, rate: 0.25 },
	{ upTo: 500000, rate: 0.30 },
	{ upTo: 800000, rate: 0.325 },
	{ upTo: Infinity, rate: 0.35 }
];

function calculatePayeMonthly(taxablePay, bands = DEFAULT_TAX_BANDS) {
	let remaining = taxablePay;
	let lastCap = 0;
	let tax = 0;
	for (const band of bands) {
		const cap = Math.min(remaining, band.upTo - lastCap);
		if (cap <= 0) { lastCap = band.upTo; continue; }
		tax += cap * band.rate;
		remaining -= cap;
		lastCap = band.upTo;
		if (remaining <= 0) break;
	}
	return Math.max(0, Math.round((tax - PERSONAL_RELIEF) * 100) / 100);
}

function calculateNssf(gross) {
	const tier1 = Math.min(gross, 6000) * 0.06;
	const tier2 = Math.min(Math.max(gross - 6000, 0), 24000 - 6000) * 0.06;
	return Math.round((tier1 + tier2) * 100) / 100; // max 1440
}

function calculateSha(gross) {
	return Math.round(gross * SHA_RATE * 100) / 100;
}

function calculateHousingLevy(gross) {
	return Math.round(gross * HOUSING_LEVY_RATE * 100) / 100;
}

export function computePayrollForEmployee(employee, { month, year }) {
	const allowancesTotal = employee.allowancesTotal || 0;
	const gross = Math.round(((employee.basicSalary || 0) + allowancesTotal) * 100) / 100;
	const nssf = calculateNssf(gross);
	const taxable = Math.max(0, gross - nssf);
	const paye = calculatePayeMonthly(taxable);
	const sha = calculateSha(gross);
	const housingLevy = calculateHousingLevy(gross);
	const otherDeductions = employee.deductionsTotal || 0;
	const net = Math.round((gross - (paye + sha + nssf + housingLevy + otherDeductions)) * 100) / 100;

	return {
		periodMonth: month,
		periodYear: year,
		gross,
		paye,
		sha,
		nssf,
		housingLevy,
		otherDeductions,
		net,
		allowances: employee.allowances || [],
		deductions: employee.deductions || [],
		breakdown: {
			personalRelief: PERSONAL_RELIEF,
			shaRate: SHA_RATE,
			housingLevyRate: HOUSING_LEVY_RATE,
			taxable,
			taxBands: DEFAULT_TAX_BANDS
		}
	};
}