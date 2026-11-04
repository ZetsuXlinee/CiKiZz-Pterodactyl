'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Gagal daftar');
        setLoading(false);
        return;
      }

      // Coba login otomatis
      const loginRes = await signIn('credentials', { 
        email: form.email, 
        password: form.password, 
        redirect: false 
      });
      
      if (loginRes?.error) {
        alert('Pendaftaran berhasil, tapi login otomatis gagal. Silakan login manual.');
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Daftar Akun</h1>
        
        <div className="space-y-4">
          <input required className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white focus:border-blue-500" placeholder="Nama Lengkap" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white focus:border-blue-500" placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white focus:border-blue-500" placeholder="Password (min. 6 karakter)" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        <button disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg mt-6">
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
        
        <p className="text-center text-sm text-gray-400 mt-4">
          Sudah punya akun? <a href="/login" className="text-blue-400">Login</a>
        </p>
      </form>
    </div>
  );
}