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
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) return alert('Gagal daftar');
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/dashboard');
  }

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">Daftar</h1>
      <input className="w-full border p-2 rounded" placeholder="Nama" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="w-full border p-2 rounded" placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full border p-2 rounded" placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
        {loading ? 'Memproses...' : 'Daftar'}
      </button>
    </form>
  );
}