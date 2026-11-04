import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') redirect('/dashboard');

  const [users, orders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-6"><p className="text-gray-500">Total User</p><p className="text-3xl font-bold">{users}</p></div>
        <div className="border rounded-xl p-6"><p className="text-gray-500">Total Order</p><p className="text-3xl font-bold">{orders}</p></div>
        <div className="border rounded-xl p-6"><p className="text-gray-500">Revenue</p><p className="text-3xl font-bold">Rp {(revenue._sum.amount ?? 0).toLocaleString('id-ID')}</p></div>
      </div>
    </div>
  );
}