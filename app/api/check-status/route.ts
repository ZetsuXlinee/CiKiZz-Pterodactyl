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
    
    // Jika server sudah selesai dibuat, kirim datanya ke frontend
    if (order.status === 'COMPLETED' && order.tempUsername) {
       return NextResponse.json({ 
         status: 'COMPLETED',
         account: {
           username: order.tempUsername,
           password: order.tempPassword,
           panelUrl: process.env.NEXT_PUBLIC_PTERO_PANEL_URL
         }
       });
    }

    if (order.status === 'PROVISIONING') {
       return NextResponse.json({ status: 'PROVISIONING' });
    }

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