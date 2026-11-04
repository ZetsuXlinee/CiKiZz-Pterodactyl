import { NextRequest, NextResponse } from 'next/server';
import { arthan } from '@/lib/arthan';
import { PLANS } from '@/lib/plans';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  planId: z.enum(['basic', 'pro', 'elite']),
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(9),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data form tidak valid.' }, { status: 400 });
    }
    
    const { planId, name, email, phone } = parsed.data;
    const plan = PLANS[planId];
    const session = await getServerSession(authOptions);
    
    const merchantRef = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 1. Buat Pembayaran ke Arthanshop
    const paymentData = await arthan.createPayment(plan.price, merchantRef);

    // 2. Simpan ke Database
    await prisma.order.create({
      data: {
        merchantRef,
        tripayRef: paymentData.transaction_id, // Kita simpan ID Arthanshop di sini
        planId,
        amount: plan.price,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        userId: session?.user?.id ?? null,
        status: 'PENDING',
      },
    });

    // 3. Kembalikan gambar QR (base64) ke frontend
    return NextResponse.json({ 
      qr_image: paymentData.qr_image,
      total_amount: paymentData.total,
      ref: merchantRef
    });
    
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}