'use client';
import { useState } from 'react';

const plans = [
  { id: 'basic', name: 'Basic', price: 2500, desc: 'Cocok untuk bot ringan', features: ['1 Bulan Aktif', '1GB RAM', '5GB Disk'] },
  { id: 'pro', name: 'Pro', price: 6500, desc: 'Paling laris untuk bot aktif', features: ['1 Bulan Aktif', '2GB RAM', '10GB Disk'], popular: true },
  { id: 'elite', name: 'Elite', price: 12000, desc: 'Untuk bot skala besar', features: ['1 Bulan Aktif', '4GB RAM', '20GB Disk'] },
];

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{img: string, total: number, ref: string} | null>(null);

  async function handleBuy(planId: string) {
    if (!form.name || !form.email || !form.phone) {
      alert('Mohon isi Nama, Email, dan No. WhatsApp terlebih dahulu di form bawah!');
      return;
    }
    setLoading(true);
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, name: form.name, email: form.email, phone: form.phone }),
      });
      
      const data = await res.json();
      
      if (data.qr_image) {
        setQrData({ img: data.qr_image, total: data.total_amount, ref: data.ref });
      } else {
        alert(data.error ? JSON.stringify(data.error) : 'Terjadi kesalahan sistem.');
      }
    } catch (err) {
      alert('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">CiKiZz Petrodactyl</h1>
          <div className="flex gap-4 text-sm font-medium text-gray-300">
            <a href="/login" className="hover:text-white">Login</a>
            <a href="/register" className="px-4 py-2 bg-white/10 rounded-lg">Daftar</a>
          </div>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Jalankan Bot Tanpa Batas.</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Layanan hosting Pterodactyl premium. Mendukung Node.js, Next.js, Python, dan HTML.</p>
      </header>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`relative p-6 rounded-2xl border ${p.popular ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-white/5'} flex flex-col`}>
              {p.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">PALING LARIS</div>}
              <h2 className="text-xl font-bold mb-1">{p.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{p.desc}</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-gray-400 text-sm">Rp</span>
                <span className="text-4xl font-extrabold">{p.price.toLocaleString('id-ID')}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuy(p.id)} disabled={loading} className={`w-full py-3 rounded-xl font-semibold ${p.popular ? 'bg-blue-600 hover:bg-blue-500' : 'bg-white/10 hover:bg-white/20'}`}>
                {loading ? 'Memproses...' : 'Pilih Paket'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-md mx-auto px-6 pb-24">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">
          <h3 className="text-2xl font-bold mb-1">Data Pembeli</h3>
          <p className="text-sm text-gray-400 mb-6">Lengkapi data untuk melanjutkan.</p>
          <div className="space-y-4">
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white" placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white" placeholder="No. WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
      </section>

      {/* MODAL QR CODE */}
      {qrData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2">Scan untuk Membayar</h3>
            <p className="text-sm text-gray-600 mb-4">Total Tagihan: <b>Rp {qrData.total.toLocaleString('id-ID')}</b></p>
            <img src={qrData.img} alt="QRIS" className="w-full rounded-lg mb-4" />
            <p className="text-xs text-gray-500 mb-6">Ref: {qrData.ref}</p>
            <button onClick={() => setQrData(null)} className="w-full bg-gray-200 py-3 rounded-lg font-semibold">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}