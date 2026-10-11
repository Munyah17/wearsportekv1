// Thin client for the payment server (server/index.js uses the official Paynow JS SDK).
const API = process.env.EXPO_PUBLIC_PAYMENT_API ?? 'http://localhost:4242';

export interface InitPaymentRequest {
  orderId: string;
  reference: string;
  amount: number;
  customerEmail?: string;
  customerPhone?: string;
  method: string; // 'ecocash' | 'innbucks' | 'omari' | 'onemoney' | 'visa_mc' | 'transfer'
  items: { title: string; amount: number }[];
}

export interface InitPaymentResponse {
  ok: boolean;
  kind: 'redirect' | 'mobile' | 'error';
  redirectUrl?: string;
  pollUrl?: string;
  instructions?: string;
  error?: string;
}

export async function initPayment(req: InitPaymentRequest): Promise<InitPaymentResponse> {
  const res = await fetch(`${API}/api/paynow/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return res.json();
}

export async function checkPaymentStatus(pollUrl: string): Promise<{ ok: boolean; status: string }> {
  const res = await fetch(`${API}/api/paynow/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pollUrl }),
  });
  return res.json();
}
