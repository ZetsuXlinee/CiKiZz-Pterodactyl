'use client';
import { useState } from 'react';

const plans = [
  { id: 'basic', name: 'Basic', price: 2500, desc: 'Cocok untuk bot ringan', features: ['1 Bulan Aktif', '1GB RAM', '5GB Disk'] },
  { id: 'pro', name: 'Pro', price: 6500, desc: 'Paling laris untuk bot aktif', features: ['q Bulan Aktif', '2GB RAM', '10GB Disk'], popular: true },
  { id: 'elite', name: 'Elite', price: 12000, desc: 'Untuk bot skala besar', features: ['1 Bulan Aktif', '4GB RAM', '20GB Disk'] },
];

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{img: string, total: number, ref: string} | null>(null);
  // State baru untuk menampung data akun
  const [accountData, setAccountData] = useState<{username: string, password: string, panelUrl: string} | null>(null);

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

  async function checkPaymentStatus() {
    if (!qrData) return;
    setLoading(true);
    try {
      const res = await fetch('/api/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: qrData.ref })
      });
      const data = await res.json();
      
      if (data.status === 'COMPLETED' && data.account) {
        // Jika selesai, tutup QRIS dan tampilkan akun
        setQrData(null);
        setAccountData(data.account);
      } else if (data.status === 'PROVISIONING') {
        alert('Pembayaran Berhasil! Server Anda sedang dibuat (mohon tunggu 10-30 detik), lalu klik Cek Status lagi.');
      } else {
        alert('Pembayaran belum masuk. Silakan tunggu 1-2 menit lalu cek lagi.');
      }
    } catch (e) {
      alert('Gagal mengecek status.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">CiKiZz Petrodactyl</h1>
          <div className="flex gap-4 text-sm font-medium text-gray-300">
            <a href="/login" className="hover:text-white transition">Login</a>
            <a href="/register" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">Daftar</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
          🚀 Server Node.js Kecepatan Tinggi
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Jalankan Bot WhatsApp & Discord <br className="hidden md:block"/> 
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Tanpa Batas.</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Layanan hosting Pterodactyl premium untuk bot Anda. Mendukung Node.js, Next.js, Python, dan HTML. Aktif instan setelah pembayaran.
        </p>
      </header>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`relative p-6 rounded-2xl border ${p.popular ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]' : 'border-white/10 bg-white/5'} flex flex-col transition-all duration-300 hover:-translate-y-1`}>
              {p.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  PALING LARIS
                </div>
              )}
              <h2 className="text-xl font-bold mb-1">{p.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{p.desc}</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-gray-400 text-sm">Rp</span>
                <span className="text-4xl font-extrabold">{p.price.toLocaleString('id-ID')}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(p.id)}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${p.popular ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'} disabled:opacity-50`}
              >
                {loading ? 'Memproses...' : 'Pilih Paket'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout Form */}
      <section className="max-w-md mx-auto px-6 pb-24">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full"></div>
          
          <h3 className="text-2xl font-bold mb-1">Data Pembeli</h3>
          <p className="text-sm text-gray-400 mb-6">Lengkapi data untuk melanjutkan ke pembayaran.</p>
          
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nama Lengkap</label>
              <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Masukkan nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Alamat Email</label>
              <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="email@contoh.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">No. WhatsApp</label>
              <input className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">Pilih paket di atas untuk melanjutkan.</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} CiKiZz Petrodactyl. All rights reserved.
      </footer>

      {/* MODAL QR CODE */}
      {qrData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full text-center relative">
            <h3 className="text-xl font-bold mb-2">Scan untuk Membayar</h3>
            <p className="text-sm text-gray-600 mb-4">Total Tagihan: <b>Rp {qrData.total.toLocaleString('id-ID')}</b></p>
            <div className="bg-gray-100 p-2 rounded-lg mb-4">
              <img src={qrData.img} alt="QRIS" className="w-full rounded" />
            </div>
            <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-100 py-1 rounded">Ref: {qrData.ref}</p>
            <button onClick={checkPaymentStatus} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-semibold mb-2 transition disabled:opacity-50">
              {loading ? 'Mengecek...' : 'Saya Sudah Bayar (Cek Status)'}
            </button>
            <button onClick={() => setQrData(null)} className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg text-sm font-semibold text-gray-700 transition">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL AKUN BERHASIL DIBUAT */}
      {accountData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-green-500/30 p-8 rounded-2xl max-w-sm w-full text-center relative shadow-[0_0_50px_-10px_rgba(34,197,94,0.3)]">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pembayaran Sukses!</h3>
            <p className="text-sm text-gray-400 mb-6">Akun Pterodactyl Anda sudah aktif. Harap simpan data di bawah ini.</p>
            
            <div className="bg-black/50 p-4 rounded-xl text-left space-y-3 mb-6 border border-white/5">
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-mono text-white text-lg font-bold">{accountData.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Password</p>
                <p className="font-mono text-white text-lg font-bold">{accountData.password}</p>
              </div>
            </div>

            <a 
              href={accountData.panelUrl} 
              target="_blank" 
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold mb-3 transition"
            >
              Buka Panel Sekarang
            </a>
            
            <button onClick={() => setAccountData(null)} className="text-sm text-gray-500 hover:text-white transition">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}