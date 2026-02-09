import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4242;
const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const feeRate = Number(process.env.PLATFORM_FEE_RATE || 0.1);

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

app.use(cors());
app.use(express.json());

if (!paystackSecret) {
  console.warn('PAYSTACK_SECRET_KEY is not set. Paystack routes will fail until configured.');
}
if (!supabaseAdmin) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Payment confirmations will not update the database.');
}

app.post('/paystack/initialize', async (req, res) => {
  try {
    const { amount, email, metadata } = req.body || {};
    if (!amount || !email) {
      return res.status(400).send('Amount and email are required.');
    }
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: Math.round(Number(amount) * 100),
        email,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data?.data;
    return res.json({
      authorization_url: data?.authorization_url,
      reference: data?.reference,
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to initialize payment.';
    return res.status(500).send(message);
  }
});

app.get('/paystack/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).send('Reference is required.');
    }
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = response.data?.data;
    return res.json({
      status: data?.status,
      reference: data?.reference,
      amount: (data?.amount || 0) / 100,
      paidAt: data?.paid_at,
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to verify payment.';
    return res.status(500).send(message);
  }
});

app.post('/paystack/confirm', async (req, res) => {
  try {
    const { reference, jobId } = req.body || {};
    if (!reference || !jobId) {
      return res.status(400).send('Reference and jobId are required.');
    }
    if (!paystackSecret) {
      return res.status(500).send('PAYSTACK_SECRET_KEY is not configured.');
    }
    if (!supabaseAdmin) {
      return res.status(500).send('Supabase admin client is not configured.');
    }

    const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = verifyResponse.data?.data;
    if (!data || data.status !== 'success') {
      return res.status(400).send('Payment not successful.');
    }

    const amount = (data.amount || 0) / 100;
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).send('Job not found in database.');
    }

    if (!job.hired_user_id) {
      return res.status(400).send('Job has no hired user.');
    }

    if (job.payment_status === 'Paid') {
      return res.json({ status: 'already_paid', jobId, amount });
    }

    const fee = Math.round(amount * feeRate * 100) / 100;
    const net = Math.round((amount - fee) * 100) / 100;
    const paidAt = data.paid_at || new Date().toISOString();

    const { error: jobUpdateError } = await supabaseAdmin
      .from('jobs')
      .update({
        status: 'Completed',
        payment_status: 'Paid',
        paid_amount: amount,
        platform_fee: fee,
        paid_at: paidAt,
      })
      .eq('id', jobId);

    if (jobUpdateError) {
      return res.status(500).send(jobUpdateError.message);
    }

    await supabaseAdmin.from('wallet_transactions').upsert([
      {
        id: `txn-${Date.now()}-earn`,
        user_id: job.hired_user_id,
        direction: 'in',
        type: 'earning',
        amount: net,
        description: `Payment for "${job.title}"`,
        job_id: jobId,
        created_at: new Date().toISOString(),
      },
      {
        id: `txn-${Date.now()}-pay`,
        user_id: job.employer_id,
        direction: 'out',
        type: 'payment',
        amount: amount,
        description: `Payment sent for "${job.title}"`,
        job_id: jobId,
        created_at: new Date().toISOString(),
      },
    ]);

    await supabaseAdmin.from('platform_transactions').upsert({
      id: `plt-${Date.now()}`,
      amount: fee,
      job_id: jobId,
      payer_id: job.employer_id,
      payee_id: job.hired_user_id,
      created_at: new Date().toISOString(),
      description: `Success fee for "${job.title}"`,
    });

    await supabaseAdmin.from('notifications').upsert([
      {
        id: `notif-${Date.now()}-employer`,
        user_id: job.employer_id,
        message: `Payment processed for "${job.title}". Success fee applied.`,
        link: { view: 'dashboard', params: {} },
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: `notif-${Date.now()}-talent`,
        user_id: job.hired_user_id,
        message: `You've been paid for "${job.title}". Check your wallet.`,
        link: { view: 'wallet', params: {} },
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.json({ status: 'success', jobId, amount, fee, net, paidAt });
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to confirm payment.';
    return res.status(500).send(message);
  }
});

app.get('/', (_, res) => {
  res.json({ status: 'GigConnect Paystack server running' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
