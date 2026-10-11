// WearSportek payment server — uses the official Paynow Node/JS SDK.
// Run: cp .env.example .env (fill in keys), then `npm run server`.
// Endpoints:
//   POST /api/paynow/init    -> create payment (web redirect or mobile push)
//   POST /api/paynow/status  -> poll a payment's status
//   POST /api/paynow/result  -> Paynow server-to-server result webhook (configure in Paynow dashboard)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Paynow } = require('paynow');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Paynow posts form-encoded results

const PORT = process.env.PORT || 4242;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:8081';
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

const paynow = new Paynow(process.env.PAYNOW_INTEGRATION_ID, process.env.PAYNOW_INTEGRATION_KEY);
paynow.resultUrl = `${PUBLIC_BASE_URL}/api/paynow/result`;
paynow.returnUrl = `${APP_BASE_URL}/payment/return`;

// Map our method ids to Paynow mobile money methods
const MOBILE_METHODS = {
  ecocash: 'ecocash',
  onemoney: 'onemoney',
  innbucks: 'innbucks',
  omari: 'omari',
};

app.post('/api/paynow/init', async (req, res) => {
  try {
    const { orderId, reference, amount, customerEmail, customerPhone, method, items } = req.body;
    if (!reference || !amount) {
      return res.status(400).json({ ok: false, kind: 'error', error: 'reference and amount required' });
    }

    const payment = paynow.createPayment(reference, customerEmail || 'customer@wearsportek.co.zw');
    (items && items.length ? items : [{ title: `WearSportek order ${orderId}`, amount }]).forEach((i) =>
      payment.add(i.title, i.amount)
    );

    if (MOBILE_METHODS[method]) {
      // Express/mobile checkout — push a payment prompt to the customer's phone
      if (!customerPhone) {
        return res.status(400).json({ ok: false, kind: 'error', error: 'Phone number required for mobile money' });
      }
      const response = await paynow.sendMobile(payment, customerPhone, MOBILE_METHODS[method]);
      if (response && response.success) {
        return res.json({
          ok: true,
          kind: 'mobile',
          pollUrl: response.pollUrl,
          instructions: response.instructions || 'Check your phone to approve the payment.',
        });
      }
      return res.json({ ok: false, kind: 'error', error: response?.error || 'Failed to initiate mobile payment' });
    }

    // Everything else (card, bank transfer, wallets via web) -> hosted Paynow checkout page
    const response = await paynow.send(payment);
    if (response && response.success) {
      return res.json({ ok: true, kind: 'redirect', redirectUrl: response.redirectUrl, pollUrl: response.pollUrl });
    }
    return res.json({ ok: false, kind: 'error', error: response?.error || 'Failed to initiate payment' });
  } catch (e) {
    console.error('paynow/init error', e);
    res.status(500).json({ ok: false, kind: 'error', error: e.message || 'Server error' });
  }
});

app.post('/api/paynow/status', async (req, res) => {
  try {
    const status = await paynow.pollTransaction(req.body.pollUrl);
    res.json({ ok: true, status: status.status, paid: status.paid() });
  } catch (e) {
    res.status(500).json({ ok: false, status: 'error', error: e.message });
  }
});

// Paynow -> us: authoritative result webhook. Verify + update order status here.
app.post('/api/paynow/result', async (req, res) => {
  try {
    const msg = req.body;
    console.log('[paynow result]', msg.reference, msg.status);
    // TODO: verify hash per Paynow docs and update the order in Supabase (service role).
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send('ERR');
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`WearSportek payment server on :${PORT}`));
