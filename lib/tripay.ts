import { Tripay } from 'tripay-node';

export const tripay = new Tripay({
  apiKey: process.env.TRIPAY_API_KEY!,
  privateKey: process.env.TRIPAY_PRIVATE_KEY!,
  merchantCode: process.env.TRIPAY_MERCHANT_CODE!,
  isProduction: process.env.TRIPAY_IS_PRODUCTION === 'true',
});