import crypto from 'crypto';

const apiKey = process.env.TRIPAY_API_KEY!;
const privateKey = process.env.TRIPAY_PRIVATE_KEY!;
const merchantCode = process.env.TRIPAY_MERCHANT_CODE!;
const isProduction = process.env.TRIPAY_IS_PRODUCTION === 'true';
const baseUrl = isProduction ? 'https://tripay.co.id/api' : 'https://tripay.co.id/api-sandbox';

export const tripay = {
  async createClosedTransaction(data: any) {
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchantCode + data.merchant_ref + data.amount)
      .digest('hex');

    const response = await fetch(`${baseUrl}/transaction/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...data,
        signature: signature,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Gagal membuat transaksi Tripay');
    }
    
    // Mengembalikan data agar sesuai dengan yang diharapkan oleh route.ts
    return result.data;
  }
};