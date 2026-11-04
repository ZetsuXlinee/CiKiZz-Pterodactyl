import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, string> = {};
  try { await prisma.$queryRaw`SELECT 1`; checks.db = 'ok'; }
  catch { checks.db = 'fail'; }

  checks.tripay = process.env.TRIPAY_API_KEY ? 'ok' : 'fail';
  checks.pterodactyl = process.env.PTERO_APP_API_KEY ? 'ok' : 'fail';
  checks.mail = process.env.RESEND_API_KEY ? 'ok' : 'fail';

  return NextResponse.json({ status: 'healthy', checks, ts: new Date().toISOString() });
}