import axios from 'axios';
import { KHQR, CURRENCY, TAG } from 'ts-khqr';

const QR_EXPIRY_MS = 15 * 60 * 1000;
const BAKONG_API_BASE = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh/v1';

export const generateKhqr = ({ amount, billNumber }) => {
  const expirationTimestamp = Date.now() + QR_EXPIRY_MS;

  const result = KHQR.generate({
    tag: TAG.INDIVIDUAL,
    accountID: process.env.KHQR_ACCOUNT_ID,
    merchantName: process.env.KHQR_MERCHANT_NAME || 'MN T-Shirt Clothing',
    acquiringBank: process.env.KHQR_ACQUIRING_BANK || undefined,
    merchantCity: process.env.KHQR_MERCHANT_CITY || 'Phnom Penh',
    currency: CURRENCY.USD,
    amount: Number(amount),
    expirationTimestamp,
    additionalData: billNumber ? { billNumber: String(billNumber) } : undefined,
  });

  if (result.status.code !== 0) {
    throw new Error(result.status.message || 'Failed to generate KHQR code');
  }

  return { qr: result.data.qr, md5: result.data.md5, expiresAt: new Date(expirationTimestamp) };
};

// Calls Bakong's Open API to check whether a KHQR (identified by its md5) has been paid.
// See: https://github.com/piseyKhenchandara/Integrating-Bakong-KHQR
export const checkKhqrPayment = async (md5) => {
  if (!process.env.BAKONG_API_TOKEN) {
    throw new Error('BAKONG_API_TOKEN is not configured');
  }

  const response = await axios.post(
    `${BAKONG_API_BASE}/check_transaction_by_md5`,
    { md5 },
    { headers: { Authorization: `Bearer ${process.env.BAKONG_API_TOKEN}` } }
  );

  const data = response.data;
  if (data.responseCode === 0 && data.data?.hash) {
    return {
      paid: true,
      hash: data.data.hash,
      amount: data.data.amount,
      currency: data.data.currency,
    };
  }

  return { paid: false };
};
