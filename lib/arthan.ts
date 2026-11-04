const API_KEY = process.env.ARTHAN_API_KEY!;
const BASE_URL = 'https://tokoshopp.web.id';

export const arthan = {
  async createPayment(amount: number, orderId: string) {
    const response = await fetch(`${BASE_URL}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'X-API-Version': 'v2',
        'User-Agent': 'ARTAN-DEV/2.0',
      },
      body: JSON.stringify({ amount, order_id: orderId }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Gagal membuat pembayaran di Arthanshop');
    }
    return data; // Mengembalikan objek berisi qr_image, transaction_id, dll.
  },

  async checkStatus(transactionId: string) {
    const response = await fetch(`${BASE_URL}/api/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'X-API-Version': 'v2',
        'User-Agent': 'ARTAN-DEV/2.0',
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });
    return await response.json();
  }
};