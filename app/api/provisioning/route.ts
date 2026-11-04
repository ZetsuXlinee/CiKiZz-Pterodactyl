import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { provisionAccount } from '@/lib/pterodactyl';
import { sendCredentials } from '@/lib/mail';
import { PLANS } from '@/lib/plans';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (req.headers.get('x-internal-token') !== process.env.INTERNAL_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { merchantRef } = await req.json();

  const order = await prisma.order.findUnique({ where: { merchantRef } });
  if (!order || order.status !== 'PROVISIONING') {
    return NextResponse.json({ ok: true });
  }

  const plan = PLANS[order.planId];
  try {
    const { user: pteroUser, server, password, username } = await provisionAccount({
      email: order.customerEmail,
      name: order.customerName,
      plan,
    });

    const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email: order.customerEmail } });
      if (!existing) {
        await tx.user.create({
          data: {
            email: order.customerEmail,
            name: order.customerName,
            passwordHash: await bcrypt.hash(password, 10),
            pteroUserId: pteroUser.id,
          },
        });
      }
      await tx.server.create({
        data: {
          orderId: order.id,
          pteroServerId: server.id,
          pteroIdentifier: server.identifier,
          name: server.name,
          expiresAt,
        },
      });
      
      // Simpan username & password sementara untuk ditampilkan di web
      await tx.order.update({
        where: { id: order.id },
        data: { 
          status: 'COMPLETED', 
          processedAt: new Date(),
          tempUsername: username,
          tempPassword: password
        },
      });
    });

    // Kirim email (tetap dijalankan, kalau gagal tidak akan menggagalkan proses)
    try {
      await sendCredentials(order.customerEmail, {
        name: order.customerName,
        username,
        password,
        panelUrl: process.env.PTERO_PANEL_URL!,
        expiresAt,
      });
    } catch (e) {
      console.log("Email gagal dikirim, tapi data disimpan di web.");
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('provision error:', err);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'FAILED', errorMessage: err?.message ?? 'unknown' },
    });
    return NextResponse.json({ error: 'provisioning failed' }, { status: 500 });
  }
}