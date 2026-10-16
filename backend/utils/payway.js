import crypto from 'crypto';

const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID;
const PUBLIC_KEY = process.env.PAYWAY_PUBLIC_KEY;
const PURCHASE_URL = process.env.PAYWAY_PURCHASE_URL || 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase';
const CHECK_TRANSACTION_URL = process.env.PAYWAY_CHECK_TRANSACTION_URL || 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2';
const RETURN_URL = process.env.PAYWAY_RETURN_URL || '';

export const isPaywayConfigured = () => Boolean(MERCHANT_ID && PUBLIC_KEY);

// Check Transaction API wants req_time as UTC 'YYYYMMDDHHmmss' -- a different
// format from the Purchase API's unix-seconds req_time below. Don't reuse one
// req_time value for both calls.
const utcTimestamp = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

/**
 * Builds and signs a PayWay purchase request, then calls PayWay's Purchase
 * API directly from the server (server-to-server avoids the CORS/widget
 * issues PayWay's browser-side flow runs into).
 *
 * Hash formula confirmed against PayWay's official Purchase API docs
 * (https://developer.payway.com.kh/purchase-14530820e0): HMAC-SHA512,
 * base64-encoded, over ALL of the fields below concatenated in this exact
 * order (empty string for anything unused). Every field concatenated into
 * the hash must also be submitted in the request, even if empty, or PayWay
 * recomputes a different hash and rejects the request as "Wrong Hash".
 *
 * `paymentOption` selects what PayWay's response looks like -- leave it ''
 * for ABA Pay/KHQR-style QR + deep link, or 'cards' to request a card entry
 * flow. Which exact response shape 'cards' returns (QR vs. a hosted
 * redirect URL) has not been confirmed against a real sandbox response yet
 * -- verify once PAYWAY_MERCHANT_ID/PAYWAY_PUBLIC_KEY are set and adjust the
 * frontend if it turns out to differ from the QR shape.
 */
export const createPaywayPurchase = async ({ amount, items = '', paymentOption = '', firstName = 'Guest', lastName = 'Customer', email = '', phone = '' }) => {
  if (!isPaywayConfigured()) {
    throw new Error('ABA PayWay is not configured yet. Set PAYWAY_MERCHANT_ID and PAYWAY_PUBLIC_KEY in the server .env.');
  }

  const tran_id = `mn-${Date.now()}`;
  const req_time = Math.floor(Date.now() / 1000).toString();

  const fields = {
    req_time,
    merchant_id: MERCHANT_ID,
    tran_id,
    amount: Number(amount).toFixed(2),
    items,
    shipping: '0', // PayWay types this as a number -- '' fails as "Wrong shipping price"
    firstname: firstName || 'Guest',
    lastname: lastName || 'Customer',
    email: email || '',
    phone: phone || '',
    type: '',
    payment_option: paymentOption,
    return_url: RETURN_URL,
    cancel_url: '',
    continue_success_url: '',
    return_deeplink: '',
    currency: 'USD',
    custom_fields: '',
    return_params: '',
    payout: '',
    lifetime: '30', // minutes; PayWay requires >= 3
    additional_params: '',
    google_pay_token: '',
    skip_success_page: '0',
  };

  const stringToHash = Object.values(fields).join('');
  const hash = crypto.createHmac('sha512', PUBLIC_KEY).update(stringToHash).digest('base64');

  const response = await fetch(PURCHASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...fields, hash }),
  });
  const data = await response.json();

  // PayWay's purchase response doesn't echo tran_id back, but the frontend
  // needs it to poll checkPaywayTransaction (Step 2 of PayWay's documented
  // integration flow).
  return { ...data, tran_id };
};

/**
 * Step 2 of PayWay's documented integration flow ("Verify Payment Status").
 * `code: "00"` from createPaywayPurchase only means the request was
 * accepted, not that the customer actually paid -- poll this until PayWay
 * reports a non-pending result.
 *
 * Hash formula confirmed against PayWay's Check Transaction API docs
 * (https://developer.payway.com.kh/check-transaction-14530826e0):
 * HMAC-SHA512, base64-encoded, over req_time + merchant_id + tran_id, signed
 * with the same Public Key as the Purchase API hash.
 *
 * The exact success value of `payment_status` (e.g. "APPROVED") has not
 * been confirmed against a live response -- only that it is uppercase and
 * that "PENDING" means not-yet-paid. Treat anything else as paid for now,
 * but double check this against a real sandbox response once credentials
 * are available, and tighten this if PayWay also returns failure/declined
 * statuses that should NOT count as paid.
 */
export const checkPaywayTransaction = async (tranId) => {
  if (!isPaywayConfigured()) {
    throw new Error('ABA PayWay is not configured yet. Set PAYWAY_MERCHANT_ID and PAYWAY_PUBLIC_KEY in the server .env.');
  }

  const req_time = utcTimestamp();
  const stringToHash = `${req_time}${MERCHANT_ID}${tranId}`;
  const hash = crypto.createHmac('sha512', PUBLIC_KEY).update(stringToHash).digest('base64');

  const response = await fetch(CHECK_TRANSACTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ req_time, merchant_id: MERCHANT_ID, tran_id: tranId, hash }),
  });
  const data = await response.json();
  const paymentStatus = data?.data?.payment_status;
  const paid = Boolean(paymentStatus) && !['PENDING', 'DECLINED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(paymentStatus);

  return { paid, status: paymentStatus || null, raw: data };
};
