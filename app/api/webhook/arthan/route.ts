import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { arthan } from '@/lib/arthan';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction_id, status } = body;

    if (status === 'paid') {
      // Cari order berdasarkan ID transaksi Arthanshop
      const order = await prisma.order.findFirst({ 
        where: { tripayRef: transaction_id } 
      });

      if (!order || order.status === 'COMPLETED') {
        return NextResponse.json({ ok: true });
      }

      // Verifikasi ulang ke API Arthanshop untuk keamanan (mencegah webhook palsu)
      const check = await arthan.checkStatus(transaction_id);
      if (!check.success || check.status !== 'paid') {
        return NextResponse.json({ error: 'Pembayaran belum terverifikasi' }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PROVISIONING' },
      });

      // Panggil fungsi provisioning (buat server Pterodactyl)
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/provisioning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-token': process.env.INTERNAL_TOKEN!,
        },
        body: JSON.stringify({ merchantRef: order.merchantRef }),
      }).catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}