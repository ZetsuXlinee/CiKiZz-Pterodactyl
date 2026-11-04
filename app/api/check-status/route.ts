import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { arthan } from '@/lib/arthan';

export async function POST(req: NextRequest) {
  try {
    const { ref } = await req.json();
    
    // 1. Cari data order di database
    const order = await prisma.order.findUnique({ where: { merchantRef: ref } });
    if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    
    // Kalau sudah selesai, jangan proses lagi
    if (order.status === 'COMPLETED' || order.status === 'PROVISIONING') {
       return NextResponse.json({ status: order.status });
    }

    // 2. Cek status langsung ke Arthanshop
    if (!order.tripayRef) return NextResponse.json({ error: 'ID transaksi tidak ada' }, { status: 400 });
    
    const check = await arthan.checkStatus(order.tripayRef);
    
    // 3. Jika statusnya 'paid' (sudah dibayar)
    if (check.success && check.status === 'paid') {
      // Ubah status jadi PROVISIONING
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PROVISIONING' },
      });

      // Tembak API internal untuk buat server Pterodactyl
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/provisioning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-token': process.env.INTERNAL_TOKEN!,
        },
        body: JSON.stringify({ merchantRef: order.merchantRef }),
      }).catch(console.error);

      return NextResponse.json({ status: 'PROVISIONING' });
    }

    return NextResponse.json({ status: 'PENDING' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}