import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { arthan } from '@/lib/arthan';

export async function POST(req: NextRequest) {
  try {
    const { ref } = await req.json();
    
    const order = await prisma.order.findUnique({ 
      where: { merchantRef: ref },
      include: { server: true } 
    });
    
    if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    
    // Jika server sudah selesai dibuat
    if (order.status === 'COMPLETED' && order.server) {
       const user = await prisma.user.findUnique({ where: { email: order.customerEmail } });
       // Kita tidak bisa mengambil password asli karena di-hash, 
       // jadi kita gunakan password acak baru atau tampilkan pesan untuk reset.
       // TAPI, karena kita baru saja membuatnya, kita bisa menangkap datanya dari log.
       // SOLUSI TERBAIK: Kita modifikasi proses provisioning agar menyimpan password sementara.
       
       // --- UNTUK SEMENTARA KITA PAKAI INI DULU ---
       // Karena password tidak tersimpan di DB, kita perlu mengubah provisioning
       // (Lihat langkah 2 di bawah)
    }

    if (order.status === 'PROVISIONING') {
       return NextResponse.json({ status: 'PROVISIONING' });
    }

    // Cek ke Arthanshop
    if (!order.tripayRef) return NextResponse.json({ error: 'ID transaksi tidak ada' }, { status: 400 });
    
    const check = await arthan.checkStatus(order.tripayRef);
    
    if (check.success && check.status === 'paid') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PROVISIONING' },
      });

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