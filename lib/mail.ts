import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCredentials(to: string, data: {
  name: string;
  username: string;
  password: string;
  panelUrl: string;
  expiresAt: Date;
}) {
  await resend.emails.send({
    from: process.env.MAIL_FROM!,
    to,
    subject: '🎉 Akun Pterodactyl CiKiZz Anda Siap!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Halo ${data.name}, akun Anda siap!</h2>
        <table cellpadding="8" style="border-collapse:collapse;background:#f6f8fa">
          <tr><td><b>Panel</b></td><td><a href="${data.panelUrl}">${data.panelUrl}</a></td></tr>
          <tr><td><b>Username</b></td><td>${data.username}</td></tr>
          <tr><td><b>Password</b></td><td>${data.password}</td></tr>
          <tr><td><b>Aktif s/d</b></td><td>${data.expiresAt.toLocaleDateString('id-ID')}</td></tr>
        </table>
        <p>Segera login dan ganti password Anda.</p>
        <p>— CiKiZz Petrodactyl</p>
      </div>
    `,
  });
}