const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export const verifyRecaptcha = async (token) => {
  if (!token) return false;

  const params = new URLSearchParams();
  params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
  params.append('response', token);

  const res = await fetch(VERIFY_URL, { method: 'POST', body: params });
  const data = await res.json();
  return data.success === true;
};
