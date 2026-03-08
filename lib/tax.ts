import { Shift, Settings } from './types';

export const TAX_CONSTANTS = {
  NO_TAX_ON_TIPS_CAP: 25000,
  FICA_RATE: 0.0765,
  QUARTERLY_DUE_DATES: ['2026-04-15', '2026-06-15', '2026-09-15', '2027-01-15'],
  // 2026 federal brackets (single filer)
  FEDERAL_BRACKETS_SINGLE: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  STANDARD_DEDUCTION_2026: 15000,
};

export interface TaxSummary {
  ytdTotalEarned: number;
  ytdTips: number;
  ytdCashTips: number;
  ytdCreditTips: number;
  ytdWages: number;
  ytdTipOut: number;
  tipsDeductionUsed: number;
  tipsDeductionRemaining: number;
  estimatedFederalTax: number;
  estimatedFICA: number;
  estimatedStateTax: number;
  estimatedQuarterlyPayment: number;
  currentQuarter: 1 | 2 | 3 | 4;
  quarterDueDate: string;
  monthlyBreakdown: MonthBreakdown[];
}

export interface MonthBreakdown {
  month: string;
  tips: number;
  wages: number;
  total: number;
}

export function getYTDShifts(shifts: Shift[], year?: number): Shift[] {
  const y = year || new Date().getFullYear();
  return shifts.filter(s => s.date.startsWith(String(y)));
}

export function getQuarter(date: Date): 1 | 2 | 3 | 4 {
  const m = date.getMonth();
  if (m < 3) return 1;
  if (m < 6) return 2;
  if (m < 9) return 3;
  return 4;
}

export function getQuarterShifts(shifts: Shift[], quarter: 1 | 2 | 3 | 4, year?: number): Shift[] {
  const y = year || new Date().getFullYear();
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 3;
  return shifts.filter(s => {
    if (!s.date.startsWith(String(y))) return false;
    const m = parseInt(s.date.slice(5, 7)) - 1;
    return m >= startMonth && m < endMonth;
  });
}

function calcFederalTax(taxableIncome: number): number {
  let tax = 0;
  let remaining = Math.max(0, taxableIncome);
  for (const bracket of TAX_CONSTANTS.FEDERAL_BRACKETS_SINGLE) {
    const bracketAmount = Math.min(remaining, bracket.max - bracket.min);
    if (bracketAmount <= 0) break;
    tax += bracketAmount * bracket.rate;
    remaining -= bracketAmount;
  }
  return tax;
}

export function calculateTaxSummary(shifts: Shift[], settings: Settings): TaxSummary {
  const now = new Date();
  const year = settings.taxYear || now.getFullYear();
  const ytdShifts = getYTDShifts(shifts, year);

  const ytdTotalEarned = ytdShifts.reduce((s, sh) => s + sh.totalEarned, 0);
  const ytdTips = ytdShifts.reduce((s, sh) => s + sh.tips, 0);
  const ytdCashTips = ytdShifts.reduce((s, sh) => s + (sh.cashTips || 0), 0);
  const ytdCreditTips = ytdShifts.reduce((s, sh) => s + (sh.creditTips || 0), 0);
  const ytdWages = ytdShifts.reduce((s, sh) => s + sh.hours * sh.hourlyWage, 0);
  const ytdTipOut = ytdShifts.reduce((s, sh) => s + sh.tipOut, 0);

  const tipsDeductionUsed = Math.min(ytdTips, TAX_CONSTANTS.NO_TAX_ON_TIPS_CAP);
  const tipsDeductionRemaining = Math.max(0, TAX_CONSTANTS.NO_TAX_ON_TIPS_CAP - ytdTips);

  // Taxable income after standard deduction and tips deduction
  const grossIncome = ytdWages + ytdTips - ytdTipOut;
  const taxableIncome = Math.max(0, grossIncome - TAX_CONSTANTS.STANDARD_DEDUCTION_2026 - tipsDeductionUsed);

  const estimatedFederalTax = calcFederalTax(taxableIncome);
  const estimatedFICA = grossIncome * TAX_CONSTANTS.FICA_RATE;
  const stateTaxRate = settings.stateTaxRate || 0;
  const estimatedStateTax = taxableIncome * stateTaxRate;

  const totalTax = estimatedFederalTax + estimatedFICA + estimatedStateTax;
  const currentQuarter = getQuarter(now);
  const estimatedQuarterlyPayment = totalTax / 4;

  // Monthly breakdown
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyBreakdown: MonthBreakdown[] = months.map((month, i) => {
    const monthShifts = ytdShifts.filter(s => parseInt(s.date.slice(5, 7)) === i + 1);
    return {
      month,
      tips: monthShifts.reduce((s, sh) => s + sh.tips, 0),
      wages: monthShifts.reduce((s, sh) => s + sh.hours * sh.hourlyWage, 0),
      total: monthShifts.reduce((s, sh) => s + sh.totalEarned, 0),
    };
  }).filter(m => m.total > 0);

  return {
    ytdTotalEarned,
    ytdTips,
    ytdCashTips,
    ytdCreditTips,
    ytdWages,
    ytdTipOut,
    tipsDeductionUsed,
    tipsDeductionRemaining,
    estimatedFederalTax,
    estimatedFICA,
    estimatedStateTax,
    estimatedQuarterlyPayment,
    currentQuarter,
    quarterDueDate: TAX_CONSTANTS.QUARTERLY_DUE_DATES[currentQuarter - 1] || '',
    monthlyBreakdown,
  };
}
