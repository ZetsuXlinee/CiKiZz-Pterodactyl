import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get('x-callback-signature');
  const event = req.headers.get('x-callback-event');

  const expected = crypto
    .createHmac('sha256', process.env.TRIPAY_PRIVATE_KEY!)
    .update(raw)
    .digest('hex');

  if (signature !== expected) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 403 });
  }
  if (event !== 'payment_status') return NextResponse.json({ ok: true });

  const { merchant_ref, status } = JSON.parse(raw);

  const order = await prisma.order.findUnique({ where: { merchantRef: merchant_ref } });
  if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 });

  // idempotency
  if (order.status === 'COMPLETED') return NextResponse.json({ ok: true });

  if (status === 'PAID') {
    await prisma.order.update({
      where: { merchantRef: merchant_ref },
      data: { status: 'PROVISIONING' },
    });

    // ─── async provisioning: panggil endpoint internal (bisa pakai QStash)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/provisioning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token': process.env.INTERNAL_TOKEN!,
      },
      body: JSON.stringify({ merchantRef: merchant_ref }),
    }).catch(console.error);
  } else if (['EXPIRED', 'FAILED'].includes(status)) {
    await prisma.order.update({
      where: { merchantRef: merchant_ref },
      data: { status: status as any },
    });
  }

  return NextResponse.json({ ok: true });
}