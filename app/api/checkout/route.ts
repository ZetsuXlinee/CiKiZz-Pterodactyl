import { NextRequest, NextResponse } from 'next/server';
import { tripay } from '@/lib/tripay';
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
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { planId, name, email, phone } = parsed.data;
  const plan = PLANS[planId];

  const session = await getServerSession(authOptions);
  const merchantRef = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const tx = await tripay.createClosedTransaction({
    method: 'QRIS',
    merchant_ref: merchantRef,
    amount: plan.price,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    order_items: [{ sku: plan.id, name: `Paket ${plan.name}`, price: plan.price, quantity: 1 }],
    callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/tripay`,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/sukses?ref=${merchantRef}`,
    expired_time: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  });

  await prisma.order.create({
    data: {
      merchantRef,
      tripayRef: tx.reference,
      checkoutUrl: tx.checkout_url,
      planId,
      amount: plan.price,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      userId: session?.user?.id ?? null,
      status: 'PENDING',
    },
  });

  return NextResponse.json({ checkout_url: tx.checkout_url, ref: merchantRef });
}