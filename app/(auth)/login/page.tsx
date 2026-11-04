'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn('credentials', { ...form, redirect: false });
    if (res?.error) return setErr('Email/password salah');
    router.push('/dashboard');
  }

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      <p className="text-sm text-center">Belum punya akun? <a href="/register" className="text-blue-600">Daftar</a></p>
    </form>
  );
}