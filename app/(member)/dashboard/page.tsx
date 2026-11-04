import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [orders, server] = await Promise.all([
    prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.server.findFirst({ where: { order: { userId: session.user.id } } }),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Halo, {session.user.name}</h1>

      <section className="border rounded-xl p-6">
        <h2 className="font-semibold mb-2">Server Anda</h2>
        {server ? (
          <div>
            <p>Nama: <b>{server.name}</b></p>
            <p>Aktif s/d: <b>{server.expiresAt.toLocaleDateString('id-ID')}</b></p>
            <a href={process.env.NEXT_PUBLIC_PTERO_PANEL_URL} target="_blank" className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded">
              Buka Panel
            </a>
          </div>
        ) : (
          <p className="text-gray-500">Belum ada server aktif.</p>
        )}
      </section>

      <section className="border rounded-xl p-6">
        <h2 className="font-semibold mb-3">Transaksi Terakhir</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Ref</th><th>Paket</th><th>Status</th><th>Tanggal</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="py-2">{o.merchantRef}</td>
                <td>{o.planId}</td>
                <td>{o.status}</td>
                <td>{o.createdAt.toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}