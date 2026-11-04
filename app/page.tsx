'use client';
import { useState } from 'react';

const plans = [
  { id: 'basic', name: 'Basic', price: 2500, desc: '1 Bulan · 1GB RAM · 5GB Disk' },
  { id: 'pro', name: 'Pro', price: 6500, desc: '3 Bulan · 2GB RAM · 10GB Disk' },
  { id: 'elite', name: 'Elite', price: 12000, desc: '6 Bulan · 4GB RAM · 20GB Disk' },
];

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  async function handleBuy(planId: string) {
    if (!form.name || !form.email || !form.phone) {
      alert('Isi semua data terlebih dahulu.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, customerName: form.name, customerEmail: form.email, customerPhone: form.phone }),
    });
    const data = await res.json();
    if (data.checkout_url) window.location.href = data.checkout_url;
    else alert(data.error || 'Terjadi kesalahan');
    setLoading(false);
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-center text-blue-600">CiKiZz Petrodactyl</h1>
      <p className="text-gray-600 mb-8 text-center">Akun member Pterodactyl untuk bot WhatsApp, Telegram, Discord. Support Node.js, Next.js, HTML.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((p) => (
          <div key={p.id} className="border rounded-xl p-6 shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-2xl font-bold my-2">Rp {p.price.toLocaleString('id-ID')}</p>
            <p className="text-sm text-gray-500 mb-4">{p.desc}</p>
            <button
              onClick={() => handleBuy(p.id)}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Beli Sekarang'}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-semibold text-lg border-b pb-2">Data Pembeli</h3>
        <input className="w-full border p-2 rounded" placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Email (Wajib dzikozik@gmail.com untuk tes)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="No. WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
    </main>
  );
}