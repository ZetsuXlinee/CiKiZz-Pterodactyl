import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { provisionAccount } from '@/lib/pterodactyl';
import { sendCredentials } from '@/lib/mail';
import { PLANS } from '@/lib/plans';
import bcrypt from 'bcryptjs';

// Wajib untuk Vercel agar tidak timeout terlalu cepat
export const runtime = 'nodejs';
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  // 1. Cek keamanan (Internal Token)
  if (req.headers.get('x-internal-token') !== process.env.INTERNAL_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { merchantRef } = await req.json();

    // 2. Cari data pesanan
    const order = await prisma.order.findUnique({ where: { merchantRef } });
    
    // Jika tidak ada pesanan atau statusnya bukan PROVISIONING, abaikan
    if (!order || order.status !== 'PROVISIONING') {
      return NextResponse.json({ ok: true, message: 'Order tidak perlu diproses' });
    }

    const plan = PLANS[order.planId];
    if (!plan) {
       throw new Error('Paket tidak ditemukan');
    }

    // 3. Panggil API Pterodactyl (Buat User & Server)
    console.log(`[PROVISIONING] Memulai pembuatan server untuk ${order.customerEmail}...`);
    
    const { user: pteroUser, server, password, username } = await provisionAccount({
      email: order.customerEmail,
      name: order.customerName,
      plan,
    });

    console.log(`[PROVISIONING] Berhasil dibuat di Pterodactyl. Server ID: ${server.id}`);

    const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000);

    // 4. Simpan ke Database (User, Server, dan Akun Asli ke Order)
    await prisma.$transaction(async (tx) => {
      // Cek apakah user website sudah ada
      const existingUser = await tx.user.findUnique({ where: { email: order.customerEmail } });
      
      if (!existingUser) {
        await tx.user.create({
          data: {
            email: order.customerEmail,
            name: order.customerName,
            passwordHash: await bcrypt.hash(password, 10),
            pteroUserId: pteroUser.id,
          },
        });
      }

      // Simpan detail server
      await tx.server.create({
        data: {
          orderId: order.id,
          pteroServerId: server.id,
          pteroIdentifier: server.identifier,
          name: server.name,
          expiresAt,
        },
      });
      
      // Update status Order jadi COMPLETED dan simpan data asli untuk Pop-up
      await tx.order.update({
        where: { id: order.id },
        data: { 
          status: 'COMPLETED', 
          processedAt: new Date(),
          tempUsername: username, // Username asli dari Pterodactyl
          tempPassword: password  // Password asli dari Pterodactyl
        },
      });
    });

    console.log(`[PROVISIONING] Data berhasil disimpan ke database.`);

    // 5. Kirim Email (Opsional, kalau gagal tidak akan menggagalkan pop-up)
    try {
      await sendCredentials(order.customerEmail, {
        name: order.customerName,
        username,
        password,
        panelUrl: process.env.PTERO_PANEL_URL!,
        expiresAt,
      });
      console.log(`[PROVISIONING] Email terkirim.`);
    } catch (e) {
      console.log(`[PROVISIONING] Email gagal dikirim (abaikan).`);
    }

    return NextResponse.json({ ok: true, message: 'Server berhasil dibuat' });

  } catch (err: any) {
    console.error('[PROVISIONING ERROR]:', err);

    // Jika terjadi error (misal Pterodactyl menolak), ubah status jadi FAILED
    // agar website berhenti loading dan menampilkan pesan error.
    try {
      const body = await req.clone().json(); // Ambil merchantRef lagi untuk update status
      if (body.merchantRef) {
        await prisma.order.update({
          where: { merchantRef: body.merchantRef },
          data: { 
            status: 'FAILED', 
            errorMessage: err?.message || 'Gagal terhubung ke Pterodactyl' 
          },
        });
      }
    } catch (dbErr) {
      console.error('Gagal update status FAILED:', dbErr);
    }

    return NextResponse.json({ error: 'provisioning failed', detail: err?.message }, { status: 500 });
  }
}